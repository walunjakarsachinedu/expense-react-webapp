import { mountStoreDevtool } from "simple-zustand-devtools";
import { v4 } from "uuid";
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import MonthExpenseRepository from "../api/MonthExpenseRepository";
import applyMiddleware from "../middleware/core/applyMiddleware";
import { PersonData, TableType, Tx } from "../models/type";
import { Prettify } from "../types/Prettify";
import personUtils from "../utils/personUtils";
import Timer from "../utils/Timer";
import utils from "../utils/utils";
import Constants from "../utils/constants";
import InMemoryCache, { InMemoryCacheCategory } from "../api/InMemoryCacheApi";

export type ExpenseStore = {
  monthYear: string;
  persons: Record<string, PersonData>;
  personIds: string[]; // for maintaining order

  setMonthYear: (monthYear: string) => void;
  setMonthData: (monthYear: string, persons: PersonData[]) => void;
  addPerson: (type: TableType) => void;
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
  delayDebounceTimer: () => void;
};

let timer: Timer;

const personStore: StateCreator<ExpenseStore, [], [["zustand/immer", never]]> =
  immer<ExpenseStore, [], []>((set, get, storeApi) => {
    timer = setupDebounceTimer(set, get);
    const selectedMonth =
      localStorage.getItem(Constants.monthStorageKey) ??
      utils.formatToMonthYear(Date.now());

    return {
      monthYear: selectedMonth,
      persons: {},
      personIds: [],
      setMonthYear: (monthYear: string) => {
        // caching before switching to different month
        InMemoryCache.provider.setCache(
          InMemoryCacheCategory.PersonMonthlyData,
          storeApi.getState().monthYear,
          Object.values(storeApi.getState().persons)
        );

        set((store) => {
          store.monthYear = monthYear;
        });
        localStorage.setItem(Constants.monthStorageKey, monthYear);
      },
      setMonthData: (monthYear, persons) => {
        set((store) => {
          store.monthYear = monthYear;
          store.persons = {};
          persons.forEach((person) => (store.persons[person._id] = person));
          store.personIds = persons
            .sort((a, b) => a.index - b.index)
            .map((person) => person._id);
        });
      },
      addPerson: (type) =>
        set((store) => {
          const id = v4();
          const index = Object.keys(store.persons).length;
          store.persons[id] = {
            _id: v4(),
            index: index,
            name: "",
            txs: {},
            version: v4(),
            txIds: [],
            month: store.monthYear,
            type: type,
          };
          store.personIds.push(id);
        }),
      deletePerson: (id) => {
        set((store) => {
          // removing person
          delete store.persons[id];
          store.personIds = store.personIds.filter(
            (personId) => personId != id
          );
          // syncing index from personIds with persons list
          store.personIds.forEach((id, index) => {
            if (store.persons[id].index != index) {
              store.persons[id].version = v4();
              store.persons[id].index = index;
            }
          });
        });
      },
      updateName: (id, name) => {
        set((state) => {
          state.persons[id].version = v4();
          state.persons[id].name = name;
        });
      },
      updatePersonIndex: (id, index) => {
        set((store) => {
          // removing from old index
          store.personIds = store.personIds.filter(
            (personId) => personId != id
          );
          // place to new index
          store.personIds.splice(index, 0, id);
          // syncing index from personIds with persons list
          store.personIds.forEach((id, index) => {
            if (store.persons[id].index != index) {
              store.persons[id].version = v4();
              store.persons[id].index = index;
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
          store.persons[personId].version = v4();
          const length = Object.keys(store.persons[personId].txs).length;
          const id = v4();
          store.persons[personId].txs[id] = { _id: id, index: length };
          store.persons[personId].txIds.push(id);
        });
      },
      deleteExpense: (id, personId) => {
        set((store) => {
          store.persons[personId].version = v4();
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
          store.persons[personId].version = v4();
          store.persons[personId].txs[id] = {
            ...store.persons[personId].txs[id],
            ...updates,
          };
        });
      },
      updateExpenseIndex: (id, index, personId) => {
        set((store) => {
          store.persons[personId].version = v4();
          const person = store.persons[personId];
          // removing from old index
          person.txIds = person.txIds.filter((txId) => txId != id);
          // adding to new index
          person.txIds.splice(index, 0, id);
          // syncing index from txIds with txs list
          person.txIds.forEach((id, index) => (person.txs[id].index = index));
        });
      },
      /** used by middleware to delay debounce timer */
      delayDebounceTimer: () => {},
    };
  });
const useExpenseStore = create<ExpenseStore>(
  applyMiddleware({
    store: personStore,
    beforeMiddlware: (action) => {
      const ignoreActions: (keyof ExpenseStore)[] = [
        "setMonthYear",
        "setMonthData",
        "copyPerson",
      ];
      if (ignoreActions.includes(action as keyof ExpenseStore)) return;
      if ((action as keyof ExpenseStore) === "delayDebounceTimer") {
        if (!timer.isRunning()) return;
      }
      // delay save
      timer.startOrDelay();
    },
  })
);

function setupDebounceTimer(
  set: (nextState: (store: ExpenseStore) => void) => void,
  get: () => ExpenseStore
): Timer {
  const timer = new Timer({
    debounceTime: 1000,
    thresholdTime: 20000,
    stopTimerOnWindowBlur: true,
  });

  let expenseStore: ExpenseStore;

  timer.startEvent.subscribe(() => {
    expenseStore = get();
  });

  timer.stopEvent.subscribe(() => {
    console.info("saving data to local storage");

    const persons = get().persons;
    const oldPersons = expenseStore.persons;
    // const patches = compare(oldPersons, persons);
    const patches = personUtils.personDiff({
      updatedData: persons,
      oldData: oldPersons,
    });
    console.log(patches);

    MonthExpenseRepository.provider.applyPatches(patches)?.then((newIds) => {
      if (!newIds) return;
      set((store) => {
        store.persons = personUtils.applyNewIds(newIds, store.persons);
      });
    });
  });

  return timer;
}

export default useExpenseStore;

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("ExpenseStore", useExpenseStore);
}
