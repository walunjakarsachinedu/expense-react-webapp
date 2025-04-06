import { produce } from "immer";
import { cloneDeep } from "lodash";
import {
  Changes,
  ConflictPerson,
  PersonData,
  PersonDiff,
  PersonVersionId,
} from "../../models/type";
import useExpenseStore, {
  ExpenseStore,
  timer,
} from "../../store/usePersonStore";
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
   * 2. update version for updated persons in patch, patchProcessing, useExpenseStore
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

    // 2. update version for updated persons in patch, cache, useExpenseStore
    patch.updated?.forEach((person) => {
      const newVersion = ObjectId.getId();
      person.version = newVersion;
    });
    if (patchProcessing.prevState) {
      patchProcessing.prevState = produce(
        patchProcessing.prevState,
        (recipe) => {
          patch.updated?.forEach((person) => {
            recipe[person._id].version = person.version;
          });
        }
      );
    }
    useExpenseStore.setState({
      persons: produce(useExpenseStore.getState().persons, (recipe) => {
        patch.updated?.forEach((person) => {
          recipe[person._id].version = person.version;
        });
      }),
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
   * 1. store conflicts to useExpenseStore
   * 2. apply changes to useExpenseStore
   * 3. apply changes to cache
   * 4. apply changes to patchProcessing
   */
  async applyServerChanges(monthYear: string, changes: Changes): Promise<void> {
    const changedPersons = changes.changedPersons;

    // 1. store conflicts to useExpenseStore
    useExpenseStore.getState().setConflicts(changes.conflictsPersons);

    // 2. apply changes to useExpenseStore
    useExpenseStore.getState().applyChanges(monthYear, changedPersons);

    // 3. apply changes to cache
    personCacheApi.clear();
    Object.values(useExpenseStore.getState().persons).forEach(
      personCacheApi.storePerson
    );

    // 4. apply changes to patchProcessing
    if (patchProcessing.prevState) {
      patchProcessing.prevState = produce(patchProcessing.prevState, (recipe) =>
        personUtils.applyChanges(recipe, changedPersons)
      );
    }
  }

  /** Delete entities marked as deleted, save those not marked as deleted. */
  async processConflicts() {
    const conflicts = useExpenseStore.getState().conflicts;
    if (!conflicts?.length) return;

    // todo: in-efficient solution, find alternative without cloning
    patchProcessing.prevState = cloneDeep(patchProcessing.prevState);

    this._deleteIfMarkedDeleted(conflicts);
    await this._saveIfNotMarkedDeleted(conflicts);
  }

  /** Delete all entity locally which are marked delete.
   *
   * Algorithm :-
   * 1. Delete deleted person, tx from patchProcessing
   * 2. Delete deleted person, tx from useExpenseStore
   * 3. Delete deleted person, tx from cache
   */
  private _deleteIfMarkedDeleted(conflicts: ConflictPerson[]) {
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
  }

  /** Save all entity to backend which are not marked delete.
   *
   * Algorithm :-
   * 1. Remove saved person & txs from old state (`patchProcessing.prevState`) to mark as added in patch
   * 2. Correct person, txs index from store.
   * 3. Trigger save changes.
   */
  private async _saveIfNotMarkedDeleted(conflicts: ConflictPerson[]) {
    // 1. Remove saved person & txs from old state (`patchProcessing.prevState`) to mark as added in patch
    patchProcessing.prevState = produce(
      patchProcessing.prevState,
      (persons) => {
        if (!persons) return;
        // removing persons
        conflicts
          .filter((conflict) => conflict.isDeleted && !conflict.toDelete)
          .forEach((person) => delete persons[person._id]);
        // removing txs
        conflicts
          .filter((conflict) => !conflict.isDeleted)
          .forEach((conflict) => {
            const txs = persons[conflict._id].txs;
            conflict.txs
              ?.filter((tx) => tx.isDeleted && !tx.toDelete)
              .forEach((tx) => delete txs[tx._id]);
          });
      }
    );

    // 2. Correct person, txs index from store.
    useExpenseStore.setState(
      produce((store: ExpenseStore) => {
        store.personIds.forEach(({ id }, index) => {
          const person = store.persons[id];
          person.index = index;
          person.txIds.forEach((id, index) => {
            person.txs[id].index = index;
          });
        });
      })
    );
    // 3. Trigger save changes.
    timer.timeout();
  }

  loadStoreWithCache() {
    const monthYear = useExpenseStore.getState().monthYear;
    const persons = personCacheApi.getAllPersons();
    useExpenseStore.getState().setMonthData(monthYear, persons);
    console.log("loaded store with cache data \\_(ツ)_/");
  }
}

export const monthExpenseRepository = new MonthExpenseRepository();
