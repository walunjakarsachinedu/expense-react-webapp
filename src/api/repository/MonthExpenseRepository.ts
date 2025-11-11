import { produce } from "immer";
import { cloneDeep } from "lodash";
import {
  Changes,
  ConflictPerson,
  CurrentState,
  MonthData,
  MonthDiff,
  VersionId
} from "../../models/type";
import useExpenseStore, {
  ExpenseStore,
  timer,
} from "../../store/usePersonStore";
import { ObjectId } from "../../utils/objectid";
import { patchProcessing } from "../../utils/PatchProcessing";
import personUtils from "../../utils/personUtils";
import {
  inMemoryCache,
  InMemoryCacheCategory,
} from "../cache/InMemoryCacheApi";
import { monthCacheApi } from "../cache/MonthCacheApi";
import { expenseBackendApi } from "../services/ExpenseBackendApi";

/** contains backend, cache interaction for operation related to month based transactions. */
class MonthExpenseRepository {
  /**
   * Goal of this method is to fetch changes from server, with assumption of no month data in memory.
   *
   * note: first it try to load from in-memory cache.
   */
  async fetchMonthData(monthYear: string) {
    const cachedMonthData = inMemoryCache.getCache<MonthData>(
      InMemoryCacheCategory.PersonMonthlyData,
      monthYear
    );
    if (cachedMonthData) {
      useExpenseStore.getState().setMonthData(monthYear, cachedMonthData);
      return;
    }

    const isMonthCached = monthCacheApi.isMonthCached();
    if(isMonthCached) {
      this.loadStoreWithCache();
    }

    useExpenseStore.getState().setSyncState("syncing");

    const patch = patchProcessing.getPatchAndDeleteFromStorage();
    const promise = this.applyPatchesAndSync({
      patch: patch ?? {},
      isMonthChanged: useExpenseStore.getState().monthYear != useExpenseStore.getState().previousMonthYear,
      monthYear,
    });

    /** 
     * only wait if store is not loaded with cached month data. 
     * waiting will make loading indicator to show until changes from server not applied. */
    if(!isMonthCached) await promise;
  }

  /**
   * Algorithm :-
   * - if month data is not loaded, then clear previous month data
   * - build person id & version array and monthlyNotes version id
   * - update version for updated persons & monthlyNotes in patch, patchProcessing, useExpenseStore
   * - apply patch to cache
   * - call _syncChanges to sync change with backend
   *   - include currentState if `isMonthDataLoaded` is true
   *
   * note: internally it uses `_syncChanges` method
   */
  async applyPatchesAndSync(args: {
    patch: MonthDiff;
    isMonthChanged: boolean;
    monthYear?: string;
  }) {
    const { patch, isMonthChanged, monthYear } = args;

    /// - if month data is not loaded, then clear previous month data
    if(isMonthChanged) {
      useExpenseStore.getState().clear();
      monthCacheApi.clear();
      patchProcessing.prevState = undefined;
    }

    /// - build person id & version array and monthlyNotes version id
    const persons = useExpenseStore.getState().getMonthData().persons;
    const personVersionIds: VersionId[] = Object.keys(persons).map(
      (_id) => ({ _id, version: persons[_id].version })
    );
    const notes = useExpenseStore.getState().getMonthData().monthlyNotes;
    const monthlyNotes: VersionId|undefined = notes?._id && notes.version 
      ? { _id: notes?._id, version: notes?.version }
      : undefined;

    /// - update version for updated persons & monthlyNotes in patch, cache, useExpenseStore
    patch.updated?.forEach((person) => {
      const newVersion = ObjectId.getId();
      person.version = newVersion;
    });
    if(patch.monthlyNotes) {
      patch.monthlyNotes.version = ObjectId.getId();
    }
    if (patchProcessing.prevState) {
      patchProcessing.setPrevState(
        produce(
          patchProcessing.prevState,
          (recipe) => {
            patch.updated?.forEach((person) => {
              recipe.persons[person._id].version = person.version;
            });
            if(patch.monthlyNotes && recipe.monthlyNotes) {
              recipe.monthlyNotes.version = patch.monthlyNotes.version;
            }
          }
        )
      );
    }
    useExpenseStore.setState({
      persons: produce(useExpenseStore.getState().persons, (recipe) => {
        patch.updated?.forEach((person) => {
          recipe[person._id].version = person.version;
        });
      }),
      monthlyNotes: produce(useExpenseStore.getState().monthlyNotes, (recipe) => {
        if(patch.monthlyNotes && recipe) {
          recipe.version = patch.monthlyNotes.version!;
        }
      })
    });


    /// - apply patch to cache
    monthCacheApi.applyChanges(patch);

    /// - call _syncChanges to sync change with backend
    await this._syncChanges({
      diff: patch,
      currenState: {
        personVersionIds: isMonthChanged ? [] : personVersionIds,
        monthlyNotesVersionId: isMonthChanged  ? undefined : monthlyNotes,
      },
      monthYear,
    });
  }

  /**
   * Algorithm :-
   * 1. send current local to backend
   * 2. apply server changes & conflicts
   */
  private async _syncChanges(args: {
    diff: MonthDiff;
    currenState: CurrentState;
    monthYear?: string;
  }): Promise<void> {
    const { diff, currenState } = args;
    const monthYear = args?.monthYear ?? useExpenseStore.getState().monthYear;

    // 1. send current local
    const changes = await expenseBackendApi
      .syncChanges(diff, monthYear, currenState)
      .then((result) => result.data!);

    // 2. apply server changes & conflicts
    return this._applyServerChanges(monthYear, changes);
  }

  /**
   * Algorithm :-
   * 1. store conflicts to useExpenseStore
   * 2. apply changes to useExpenseStore
   * 3. apply changes to cache
   * 4. apply changes to patchProcessing
   */
  async _applyServerChanges(monthYear: string, changes: Changes): Promise<void> {
    const changedPersons = changes.changedPersons;

    // 1. store conflicts to useExpenseStore
    useExpenseStore.getState().setConflicts(changes.conflictsPersons);

    // 2. apply changes to useExpenseStore
    useExpenseStore.getState().applyChanges(changedPersons, changes.monthlyNotes);

    // 3. apply changes to cache
    monthCacheApi.applyChanges({
      added: changedPersons.addedPersons, 
      deleted: changedPersons.deletedPersons, 
      updated: changedPersons.updatedPersons,
      monthlyNotes: changes.monthlyNotes 
    });

    // 4. apply changes to patchProcessing
    if (patchProcessing.prevState) {
      patchProcessing.setPrevState(
        produce(patchProcessing.prevState, (recipe) => {
          personUtils.applyChanges(recipe, changedPersons, changes.monthlyNotes);
        })
      );
    }

    useExpenseStore.getState().setSyncState("synced");
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
        { persons: patchProcessing.prevState?.persons },
        personId
      );
    });
    txToDelete.forEach((tx) => {
      if (tx?.personId) {
        personUtils.deleteEntity(
          { persons: patchProcessing.prevState?.persons },
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
    personToDelete.forEach(monthCacheApi.deletePersonWithId);
    txToDelete
      .filter((tx) => !!tx)
      .map((tx) => personData[tx.personId])
      .forEach(monthCacheApi.storePerson);
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
    if(patchProcessing.prevState) {
      patchProcessing.setPrevState(
        produce(
          patchProcessing.prevState,
          (monthData) => {
            const persons = monthData?.persons;
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
        )
      )
    }

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
    const monthData = monthCacheApi.getMonthData();
    useExpenseStore.getState().setMonthData(monthYear, monthData);
    console.log("loaded store with cache data \\_(ツ)_/");
  }
}

export const monthExpenseRepository = new MonthExpenseRepository();
