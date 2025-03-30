import { produce } from "immer";
import { cloneDeep } from "lodash";
import {
  Changes,
  PersonData,
  PersonDiff,
  PersonPatch,
  PersonVersionId,
  Tx,
} from "../../models/type";
import useExpenseStore from "../../store/usePersonStore";
import { ObjectId } from "../../utils/objectid";
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
   * Goal of this method is to fetch changes from server, with assumption of no month data in memory.
   *
   * note: first it try to load from in-memory cache.
   */
  async fetchMonthData(monthYear: string) {
    const cachedPersonData = inMemoryCache.getCache<PersonData[]>(
      InMemoryCacheCategory.PersonMonthlyData,
      monthYear
    );
    if (cachedPersonData) {
      useExpenseStore.getState().setMonthData(monthYear, cachedPersonData);
      return;
    }

    const patch = patchProcessing.getPatchAndDeleteFromStorage();
    await this.applyPatchesAndSync({
      patch: patch ?? {},
      isMonthDataLoaded: false,
      monthYear,
    });
  }

  /**
   * Algorithm :-
   * 1. build person id & version array using store if month data is loaded else cache
   * 2. update version of each updated person in patch
   * 3. apply patch to cache
   * 4. call _syncChanges to sync change with backend
   *
   * note: internally it uses `_syncChanges` method
   */
  async applyPatchesAndSync(args: {
    patch: PersonDiff;
    /** Defaults to `true`.*/
    isMonthDataLoaded?: boolean;
    monthYear?: string;
  }) {
    const { patch, isMonthDataLoaded = true, monthYear } = args;

    // 1. build person id & version array using store if month data is loaded else cache
    const persons = isMonthDataLoaded
      ? useExpenseStore.getState().persons
      : utils.toMapById(personCacheApi.getAllPersons());
    const personVersionIds: PersonVersionId[] = Object.keys(persons).map(
      (_id) => ({ _id, version: persons[_id].version })
    );

    // 2. update version of each updated person in patch
    patch.updated?.forEach((person) => {
      person.version = ObjectId.getId();
    });

    // 3. apply patch to cache
    personCacheApi.applyChanges(patch);

    // 4. call _syncChanges to sync change with backend
    await this._syncChanges({
      diff: patch,
      personVersionIds: personVersionIds,
      monthYear,
    });
  }

  /**
   * Algorithm :-
   * 1. send current local to backend
   * 2. apply server changes & conflicts
   */
  private async _syncChanges(args: {
    diff: PersonDiff;
    personVersionIds: PersonVersionId[];
    monthYear?: string;
  }): Promise<void> {
    const { diff, personVersionIds } = args;
    const monthYear = args?.monthYear ?? useExpenseStore.getState().monthYear;

    // 1. send current local
    const changes = await expenseBackendApi
      .syncChanges(diff, monthYear, personVersionIds)
      .then((result) => result.data!);

    // 2. apply server changes & conflicts
    return this.applyServerChanges(monthYear, changes);
  }

  /**
   * Algorithm :-
   * 1. apply changes to cache
   * 2. apply changes to useExpenseStore
   * 3. apply changes to patchProcessing
   * 4. store conflicts to useExpenseStore
   */
  async applyServerChanges(monthYear: string, changes: Changes): Promise<void> {
    const changedPersons = changes.changedPersons;

    // 1. apply changes to cache
    const updateCacheData = Object.values(
      personUtils.applyChanges(
        utils.toMapById(personCacheApi.getAllPersons()),
        changes.changedPersons
      )
    );
    personCacheApi.clear();
    updateCacheData.forEach(personCacheApi.storePerson);

    // 2. apply changes to useExpenseStore
    useExpenseStore.getState().applyChanges(monthYear, changedPersons);

    // 3. apply changes to patchProcessing
    if (patchProcessing.prevState) {
      patchProcessing.prevState = personUtils.applyChanges(
        patchProcessing.prevState,
        changedPersons
      );
    }

    // 4. store conflicts to useExpenseStore
    useExpenseStore.getState().setConflicts(changes.conflictsPersons);
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
    });
    txToDelete.forEach((tx) => {
      if (tx?.personId) {
        personUtils.deleteEntity(
          { persons: patchProcessing.prevState },
          tx.personId,
          tx._id
        );
      }
    });

    // TODO: move logic to expense store
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
}

export const monthExpenseRepository = new MonthExpenseRepository();
