import { produce } from "immer";
import { cloneDeep, update } from "lodash";
import {
  Changes,
  ConflictPerson,
  ConflictTx,
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
import TrackedPromise from "../../utils/TrackPromise";

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
    else {
      patchProcessing.setCurrentActionStatus(new TrackedPromise(promise));
    }
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
   * - move server deletes that conflict with client updates to conflicts
   * - store conflicts to useExpenseStore
   * - calculate updateDiff from server changes to apply to prev & store state
   * - apply updateDiff to useExpenseStore
   * - apply updateDiff to patchProcessing
   * - apply changes to cache
   */
  async _applyServerChanges(monthYear: string, changes: Changes): Promise<void> {
    /// - move server deletes that conflict with client updates to conflicts
    changes = this.includeLocalConflicts(changes);

    const changedPersons = changes.changedPersons;

    /// - store conflicts to useExpenseStore
    useExpenseStore.getState().setConflicts(changes.conflictsPersons);

    /// - calculate updateDiff from server changes to apply to prev & store state
    const updateDiff = personUtils.serverChangesToUpdateDiff(changes);

    /// - apply changes to useExpenseStore
    useExpenseStore.getState().applyChanges(updateDiff);

    /// - apply changes to patchProcessing
    if (patchProcessing.prevState) {
      patchProcessing.setPrevState(
        produce(patchProcessing.prevState, (recipe) => {
          personUtils.applyChanges(recipe, updateDiff);
        })
      );
    }

    /// - apply changes to cache
    const state = useExpenseStore.getState();
    monthCacheApi.applyChanges({
      added: changedPersons.addedPersons, 
      deleted: changedPersons.deletedPersons, 
      updated: changedPersons.updatedPersons.map(({_id}) => state.persons[_id]),
      monthlyNotes: changes.monthlyNotes 
    });

    useExpenseStore.getState().setSyncState("synced");
  }

  /** Algorithm:-
   * - includes conflicting local changes. 
   *    - find person level conflict
   *    - find tx level conflict
   *    - merge person & tx level conflict with server conflict 
   * - remove server delete changes which are conflicting.
   * 
   * note: conflict: entity updated locally but deleted from server
   * */
  includeLocalConflicts(serverChanges: Changes): Changes {
    if(patchProcessing.prevState) {
      const localDiff = personUtils.monthDiff({
        updatedData: useExpenseStore.getState().getMonthData(),
        oldData: patchProcessing.prevState,
      });
      if(localDiff.updated?.length) {
        
        /// - find person level conflict
        const conflictingDeletedPersons = serverChanges.changedPersons.deletedPersons
          .filter(id => localDiff?.updated?.some(patch => patch._id == id))
          .map(_id => ({_id, isDeleted: true} as ConflictPerson));
        

        /// - find tx level conflict
        const conflictTxs = localDiff.updated
          .filter(person => person.txDiff?.updated?.length)
          .map(person => ({
            localPatch: person,
            updated: serverChanges.changedPersons.updatedPersons.find(({_id}) => _id == person._id), 
          }))
          .filter(data => data.updated)
          .map(({localPatch, updated}) => ({
            localPatch, 
            serverPatch: personUtils.personPatch(
              personUtils.personTxToPerson(updated!), 
              useExpenseStore.getState().persons[localPatch._id]
            )
          }))
          .map(({localPatch, serverPatch}) => {
            // tx updated locally but deleted on server
            const conflictingTx = serverPatch?.txDiff?.deleted
              ?.filter(id => localPatch.txDiff?.updated?.some(txPatch => txPatch._id == id));
            return {
              _id: localPatch._id,
              txs: conflictingTx?.map(_id => ({_id, isDeleted: true})),
              isDeleted: false
            } satisfies ConflictPerson;
          })
          .filter(conflict => conflict.txs?.length);

          /// - merge person & tx level conflict with server conflict
          const conflictsPersons = Object.values([
            ...serverChanges.conflictsPersons, 
            ...conflictingDeletedPersons,
            ...conflictTxs
          ].reduce((acc, cur) => {
            if(acc[cur._id]) {
              if(!acc[cur._id]?.isDeleted) {
                // priority => person conflict take priority over tx conflict
                if(cur.isDeleted) {
                  acc[cur._id].isDeleted = true;
                  delete acc[cur._id].txs;
                }
                // merge txs conflict array
                else {
                  acc[cur._id].txs = Object.values([
                    ...(acc[cur._id].txs ?? []),  
                    ...(cur.txs ?? []) 
                  ].reduce((acc, cur) => {
                    acc[cur._id] ??= cur;
                    return acc;
                  }, {} as Record<string, ConflictTx>));
                }
              } 
            }

            acc[cur._id] ??= cur;

            return acc;
          }, {} as Record<string, ConflictPerson>));

        /// - remove server delete changes which are conflicting.
        serverChanges.changedPersons.deletedPersons = serverChanges.changedPersons
          .deletedPersons.filter(
            id => !conflictsPersons.some(conflictPerson => conflictPerson._id == id)
          );

        return { ...serverChanges, conflictsPersons };
      }
    }
    return serverChanges;
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

            Object.values(persons).forEach(person => personUtils.normalizePerson(person, true));
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
