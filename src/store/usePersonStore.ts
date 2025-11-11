import { mountStoreDevtool } from "simple-zustand-devtools";
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  inMemoryCache,
  InMemoryCacheCategory,
} from "../api/cache/InMemoryCacheApi";
import { monthExpenseRepository } from "../api/repository/MonthExpenseRepository";
import applyMiddleware from "../middleware/core/applyMiddleware";
import {
  ChangedPersons,
  ConflictPerson,
  Filter,
  MonthData,
  MonthlyNotes,
  PersonData,
  SyncStates,
  Tx,
  TxType,
} from "../models/type";
import { Prettify } from "../types/Prettify";
import Constants from "../utils/constants";
import { ObjectId } from "../utils/objectid";
import { patchProcessing } from "../utils/PatchProcessing";
import personUtils from "../utils/personUtils";
import Timer from "../utils/Timer";
import utils from "../utils/utils";
import { monthCacheApi } from "../api/cache/MonthCacheApi";

export type ExpenseStore = {
  syncState: SyncStates;
  /** store in format: mm-yyyy. e.g. 10-2025. */
  monthYear: string;
  /** use to track changes in `monthYear`. */
  previousMonthYear: string;
  persons: Record<string, PersonData>;
  personIds: { id: string; type: TxType }[]; // for maintaining order
  monthlyNotes: MonthlyNotes;

  conflicts?: ConflictPerson[];
  isConflictsFound: boolean;

  filter: Filter;

  setSyncState: (state: SyncStates) => void;
  setConflicts: (conflicts: ConflictPerson[]) => void;
  clearConflicts: () => void;

  updateMonthlyNotes: (notes: string) => void;

  setMonthYear: (monthYear: string) => void;
  /** Use to apply changes from server to client. */
  applyChanges: (persons: ChangedPersons, monthlyNotes?: MonthlyNotes) => void;
  setMonthData: (monthYear: string, monthData: MonthData) => void;
  getMonthData: () => MonthData;
  addPerson: (type: TxType) => void;
  deletePerson: (id: string) => void;
  updateName: (id: string, name: string) => void;
  updatePersonIndex: (id: string, index: number) => void;
  copyPerson: (id: string) => void;

  addExpense: (personId: string) => void;
  deleteExpense: (id: string, personId: string) => void;
  updateExpense: (
    id: string,
    personId: string,
    tx: Prettify<Omit<Tx, "_id" | "index">>
  ) => void;
  updateExpenseIndex: (id: string, index: number, personId: string) => void;
  /** clear data of current month from store. */
  clear: () => void;
  updateFilter: (filter: Filter) => void;
  delayDebounceTimer: () => void;
};

let timer: Timer;

const personStore: StateCreator<ExpenseStore, [], [["zustand/immer", never]]> =
  immer<ExpenseStore, [], []>((set, get, storeApi) => {
    timer = setupDebounceTimer();
    const selectedMonth =
      localStorage.getItem(Constants.monthStorageKey) ??
      utils.formatToMonthYear(Date.now());
    if(!localStorage.getItem(Constants.monthStorageKey)) {
      localStorage.setItem(Constants.monthStorageKey, selectedMonth);
    }

    return {
      syncState: "none",
      monthYear: selectedMonth,
      previousMonthYear: selectedMonth,
      persons: {},
      personIds: [],
      isConflictsFound: false,
      monthlyNotes: {
        notes: ""
      } as MonthlyNotes,
      filter: {},

      setSyncState: (state) => {
        set((store) => {
          if(store.syncState == "none" && state == "synced") return;
          store.syncState = state;
        })
      },
      setConflicts: (conflicts) => {
        if (!conflicts.length) return;
        set((_) => ({
          isConflictsFound: true,
          conflicts: conflicts,
        }));
      },
      clearConflicts: () => {
        set((store) => {
          store.isConflictsFound = false;
          store.conflicts = [];
        });
      },

      updateMonthlyNotes: (notes: string) => {
        set((store) => {
          if(!store.monthlyNotes._id) store.monthlyNotes._id = ObjectId.getId();
          store.monthlyNotes.notes = notes;
        }) 
      },

      setMonthYear: (monthYear: string) => {
        // save change considering: user is changing month
        timer.timeout();

        // in-memory caching before switching to different month
        inMemoryCache.setCache<MonthData>(
          InMemoryCacheCategory.PersonMonthlyData,
          storeApi.getState().monthYear,
          storeApi.getState().getMonthData()
        );

        set((store) => {
          store.previousMonthYear = store.monthYear;
          store.monthYear = monthYear;
          store.setSyncState("synced");
        });
        localStorage.setItem(Constants.monthStorageKey, monthYear);

        // clearing cache if month is different
        if(!monthCacheApi.isMonthCached()) monthCacheApi.clear();
      },
      getMonthData: () => {
        return {
          persons: storeApi.getState().persons, 
          monthlyNotes: storeApi.getState().monthlyNotes
        };
      },
      applyChanges: (changedPersons, monthlyNotes) => {
        set((store) => {
          store.persons = personUtils.applyChanges(
            store,
            changedPersons
          );
          store.personIds = Object.values(store.persons)
            .sort((a, b) => a.index - b.index)
            .map((person) => ({ id: person._id, type: person.type }));
          if(monthlyNotes) store.monthlyNotes = monthlyNotes;

          if(store.filter.filteredTxIds) {
            [...changedPersons.addedPersons, ...changedPersons.updatedPersons].forEach((person) => {
                Object.values(person.txs)
                  .filter(tx => _isTxSatisfyFilter(tx, store.filter))
                  .forEach(tx => {
                    store.filter.filteredTxIds!.add(tx._id);
                  });
            });
          }

          monthCacheApi.setCacheMonthYear(storeApi.getState().monthYear);
        });
      },
      setMonthData: (monthYear, monthData) => {
        set((store) => {
          store.monthYear = monthYear;
          store.persons = {};
          const persons = Object.values(monthData.persons); 
          persons.forEach((person) => (store.persons[person._id] = person));
          store.personIds = persons
            .sort((a, b) => a.index - b.index)
            .map((person) => ({ id: person._id, type: person.type }));
          store.monthlyNotes = monthData.monthlyNotes ?? ({notes: ""} as MonthlyNotes);
        });
        monthCacheApi.cacheMonthData(monthYear, monthData);
        patchProcessing.setPrevState(storeApi.getState().getMonthData());
      },
      addPerson: (type) =>
        set((store) => {
          const id = ObjectId.getId();
          const index = Object.keys(store.persons).length;
          store.persons[id] = {
            _id: id,
            index: index,
            name: "",
            txs: {},
            version: ObjectId.getId(),
            txIds: [],
            month: store.monthYear,
            type: type,
          };
          store.personIds.push({ id, type });
        }),
      deletePerson: (id) => {
        set((store) => {
          // removing person
          delete store.persons[id];
          store.personIds = store.personIds.filter((person) => person.id != id);
          // syncing index from personIds with persons list
          store.personIds.forEach((person, index) => {
            if (store.persons[person.id].index != index) {
              store.persons[person.id].index = index;
            }
          });
        });
      },
      updateName: (id, name) => {
        set((state) => {
          state.persons[id].name = name;
        });
      },
      updatePersonIndex: (id, index) => {
        set((store) => {
          // removing from old index
          store.personIds = store.personIds.filter((person) => person.id != id);
          // place to new index
          store.personIds.splice(index, 0, {
            id: id,
            type: store.persons[id].type,
          });
          // syncing index from personIds with persons list
          store.personIds.forEach((person, index) => {
            if (store.persons[person.id].index != index) {
              store.persons[person.id].index = index;
            }
          });
        });
      },
      copyPerson: (id) => {
        const textToCopy = personUtils.personToString(get().persons[id]);
        navigator.clipboard.writeText(textToCopy);
      },
      addExpense: (personId) => {
        set((store) => {
          const length = Object.keys(store.persons[personId].txs).length;
          const id = ObjectId.getId();
          store.persons[personId].txs[id] = { _id: id, index: length };
          if(store.monthYear == utils.formatToMonthYear(Date.now())) {
            store.persons[personId].txs[id].performedAt = new Date().getDate();
          }
          store.persons[personId].txIds.push(id);
          store.filter.ignoreTxIds?.add(id);
        });
      },
      deleteExpense: (id, personId) => {
        set((store) => {
          const person = store.persons[personId];
          // removing tx
          delete person.txs[id];
          person.txIds = person.txIds.filter((txId) => txId != id);
          // syncing index from txIds with txs list
          person.txIds.forEach((id, index) => (person.txs[id].index = index));
        });
      },
      updateExpense: (id: string, personId, updates) => {
        set((store) => {
          store.persons[personId].txs[id] = {
            ...store.persons[personId].txs[id],
            ...updates,
          };
          store.filter.ignoreTxIds?.add(id);
        });
      },
      updateExpenseIndex: (id, index, personId) => {
        set((store) => {
          const person = store.persons[personId];
          // removing from old index
          person.txIds = person.txIds.filter((txId) => txId != id);
          // adding to new index
          person.txIds.splice(index, 0, id);
          // syncing index from txIds with txs list
          person.txIds.forEach((id, index) => (person.txs[id].index = index));
        });
      },
      clear: () => {
        set((store) => {
          store.persons = {};
          store.personIds = [];
          store.monthlyNotes = { notes: "" } as MonthlyNotes;
        })
      },
      updateFilter: (filter) => {
        set((store) => {
          store.filter = { ...filter, ignoreTxIds: new Set() };

          if (!filter.startDay || !filter.endDay) return;

          const filteredTxIds = new Set<string>();
          Object.values(store.persons)
            .forEach(person => {
              Object.values(person.txs)
                .filter(tx => _isTxSatisfyFilter(tx, filter))
                .forEach(tx => {
                  filteredTxIds.add(tx._id);
                });
            });

          store.filter.filteredTxIds = filteredTxIds;
        })
      },
      /** used by middleware to delay debounce timer */
      delayDebounceTimer: () => {},
    };
  });

const useExpenseStore = create<ExpenseStore>(
  applyMiddleware({
    store: personStore,
    beforeMiddlware: (action) => {
      /** Represent actions which doesn't cause data change because of user. */
      const ignoreActions: (keyof ExpenseStore)[] = [
        "setMonthYear",
        "setMonthData",
        "getMonthData",
        "applyChanges",
        "copyPerson",
        "setConflicts",
        "setSyncState",
        "clear",
        "updateFilter"
      ];
      if (ignoreActions.includes(action as keyof ExpenseStore)) return;
      // delayDebounceTimer action - delay the timer only if user is working
      if ((action as keyof ExpenseStore) === "delayDebounceTimer") {
        if (!timer.isRunning()) return;
      }
      // delay save
      timer.startOrDelay();

      useExpenseStore.getState().setSyncState("unSync");
    },
  })
);

function setupDebounceTimer(): Timer {
  const timer = new Timer({
    debounceTime: 2000,
    thresholdTime: 20000,
    timeoutOnWindowBlur: true,
  });

  timer.stopEvent.subscribe(() => {
    console.info("scheduling patch processing");

    const nextState = useExpenseStore.getState().getMonthData();
    patchProcessing.processPatch(nextState, async (patch) => {
      if (utils.isPatchEmpty(patch)) return;
      console.log("processing patch: ", patch);
      await monthExpenseRepository.applyPatchesAndSync({ patch, isMonthChanged: false });
    });
  });

  return timer;
}

function _isTxSatisfyFilter(tx: Tx, filter: Filter) {
  return tx.performedAt
  && (tx.performedAt >= filter.startDay! && tx.performedAt <= filter.endDay!); 
}


export { timer };

export default useExpenseStore;

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("ExpenseStore", useExpenseStore);
}
