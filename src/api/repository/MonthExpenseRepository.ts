import { produce } from "immer";
import { cloneDeep } from "lodash";
import {
  Conflicts,
  PersonData,
  PersonDiff,
  PersonPatch,
  PersonVersionId,
  ResponseData,
  Tx,
} from "../../models/type";
import useExpenseStore from "../../store/usePersonStore";
import { patchProcessing } from "../../utils/PatchProcessing";
import personUtils from "../../utils/personUtils";
import utils from "../../utils/utils";
import {
  inMemoryCache,
  InMemoryCacheCategory,
} from "../cache/InMemoryCacheApi";
import { personCacheApi } from "../cache/PersonCacheApi";
import { expenseBackendApi } from "../services/ExpenseBackendApi";

/** contains backend, cache interaction for operation related to month based transactions. */
class MonthExpenseRepository {
  /**
   * Algorithm :-
   * 1. send pending patch
   * 2. if data found in in-memory cache, then return data from cache
   * 3. fetch cache & changed persons
   * 4. remove un-used persons from cache
   * 5. store updated & added persons to cache
   * 6. merge changed persons with cache
   */
  async getMonthExpense(monthYear: string): Promise<PersonData[]> {
    // 1. send pending patch
    await patchProcessing.processPatchFromStorage(async (patches) => {
      await monthExpenseRepository.applyPatches(patches);
    });

    // 2. if data found in in-memory cache, then return data from cache
    const cachedPersonData = inMemoryCache.getCache<PersonData[]>(
      InMemoryCacheCategory.PersonMonthlyData,
      monthYear
    );
    if (cachedPersonData) return cachedPersonData;

    // 3. fetch cache & changed persons
    const persons: PersonData[] = personCacheApi.getAllPersons();

    const personVersionIds: PersonVersionId[] = persons.map((person) => ({
      _id: person._id,
      version: person.version,
    }));

    const changedPersons = await expenseBackendApi
      .getChangedPersons(monthYear, personVersionIds)
      .then((result) => result.data!);

    const cachedPersons = persons.filter(
      (person) =>
        !changedPersons.updatedPersons.find(({ _id }) => _id == person._id) &&
        !changedPersons.deletedPersons.find((id) => id == person._id)
    );

    const addedPersons = changedPersons.addedPersons.map(
      personUtils.personTxToPerson
    );
    const updatedPersons = changedPersons.updatedPersons.map(
      personUtils.personTxToPerson
    );

    // 4. remove un-used persons from cache
    changedPersons.deletedPersons.forEach(personCacheApi.deletePersonWithId);

    // 5. store updated & added persons to cache
    [...changedPersons.updatedPersons, ...changedPersons.addedPersons]
      .map(personUtils.personTxToPerson)
      .forEach(personCacheApi.storePerson);

    // 6. merge changed persons with cache
    return [...cachedPersons, ...addedPersons, ...updatedPersons]
      .map((person) => {
        person.txIds.forEach((id, index) => (person.txs[id].index = index));
        return person;
      })
      .sort((person) => person.index - person.index);
  }

  /**
   * Algorithm :-
   * 1. Delete deleted person, tx from patchProcessing
   * 2. Delete deleted person, tx from useExpenseStore
   * 3. Delete deleted person, tx from cache
   * 4. Prepare patch of saved persons & txs
   * 5. Send patch to backend
   */
  async processConflicts() {
    const conflicts = useExpenseStore.getState().conflicts;
    if (!conflicts?.length) return;

    // todo: in-efficient solution, find alternative without cloning
    patchProcessing.nextState = cloneDeep(patchProcessing.nextState);
    patchProcessing.prevState = cloneDeep(patchProcessing.prevState);

    const personToDelete = conflicts
      .filter((el) => el.isDeleted && el.toDelete)
      .map((el) => el._id);
    const txToDelete = conflicts
      .filter((el) => !el.isDeleted)
      .filter((el) => el.txs?.find((tx) => tx.isDeleted && tx.toDelete))
      .flatMap((el) =>
        el.txs?.map((tx) => ({
          _id: tx._id,
          personId: el._id,
        }))
      );

    // 1. Delete deleted person, tx from patchProcessing
    personToDelete.forEach((personId) => {
      personUtils.deleteEntity(
        { persons: patchProcessing.prevState },
        personId
      );
      personUtils.deleteEntity(
        { persons: patchProcessing.nextState },
        personId
      );
    });
    txToDelete.forEach((tx) => {
      if (tx?.personId) {
        personUtils.deleteEntity(
          { persons: patchProcessing.prevState },
          tx.personId,
          tx._id
        );
        personUtils.deleteEntity(
          { persons: patchProcessing.nextState },
          tx.personId,
          tx._id
        );
      }
    });

    // 2. Delete deleted person, tx from useExpenseStore
    useExpenseStore.setState(
      produce(
        {
          personIds: useExpenseStore.getState().personIds,
          persons: useExpenseStore.getState().persons,
        },
        (draft) => {
          personToDelete.forEach((personId) => {
            personUtils.deleteEntity(draft, personId);
          });
          txToDelete.forEach((tx) => {
            if (tx?.personId) {
              personUtils.deleteEntity(draft, tx.personId, tx._id);
            }
          });
          return draft;
        }
      )
    );

    // 3. Delete deleted person, tx from cache
    const personData = useExpenseStore.getState().persons;
    personToDelete.forEach(personCacheApi.deletePersonWithId);
    txToDelete
      .filter((tx) => !!tx)
      .map((tx) => personData[tx.personId])
      .forEach(personCacheApi.storePerson);

    // 4. Prepare patch of saved persons & txs
    const personToSave = conflicts
      .filter((el) => el.isDeleted && !el.toDelete)
      .map((el) => el._id)
      .map((id) => personData[id])
      .map(personUtils.personToPersonTx);
    const txToSave = Object.entries(
      conflicts
        .filter((el) => !el.isDeleted)
        .flatMap((el) =>
          el.txs
            ?.filter((tx) => tx.isDeleted && !tx.toDelete)
            .map((tx) => ({ _id: tx._id, personId: el._id }))
        )
        .filter((tx) => !!tx)
        .reduce((acc, tx) => {
          acc[tx.personId] ??= {
            version: personData[tx.personId].version,
            txs: [],
          };
          acc[tx.personId].txs.push(personData[tx.personId].txs[tx._id]);
          return acc;
        }, {} as Record<string, { txs: Tx[]; version: string }>)
    ).map<PersonPatch>(([personId, data]) => ({
      _id: personId,
      txDiff: { added: data.txs },
      version: data.version,
    }));

    // 5. Send patch to backend
    const diff: PersonDiff = { added: personToSave, updated: txToSave };
    if (diff.added?.length == 0) delete diff.added;
    if (diff.updated?.length == 0) delete diff.updated;

    if (utils.isPatchEmpty(diff)) return;
    await expenseBackendApi.applyChanges(diff);
  }

  async applyPatches(patches: PersonDiff): ResponseData<Conflicts> {
    personCacheApi.applyChanges(patches);
    return expenseBackendApi.applyChanges(patches);
  }
}

export const monthExpenseRepository = new MonthExpenseRepository();
