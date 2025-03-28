import { mountStoreDevtool } from "simple-zustand-devtools";
import { create, StateCreator } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  inMemoryCache,
  InMemoryCacheCategory,
} from "../api/cache/InMemoryCacheApi";
import { monthExpenseRepository } from "../api/repository/MonthExpenseRepository";
import applyMiddleware from "../middleware/core/applyMiddleware";
import { ConflictPerson, PersonData, Tx, TxType } from "../models/type";
import { Prettify } from "../types/Prettify";
import Constants from "../utils/constants";
import { ObjectId } from "../utils/objectid";
import { patchProcessing } from "../utils/PatchProcessing";
import personUtils from "../utils/personUtils";
import Timer from "../utils/Timer";
import utils from "../utils/utils";

export type ExpenseStore = {
  monthYear: string;
  persons: Record<string, PersonData>;
  personIds: { id: string; type: TxType }[]; // for maintaining order

  conflicts?: ConflictPerson[];
  isConflictsFound: boolean;

  clearConflicts: () => void;

  setMonthYear: (monthYear: string) => void;
  setMonthData: (monthYear: string, persons: PersonData[]) => void;
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
  delayDebounceTimer: () => void;
};

let timer: Timer;

const personStore: StateCreator<ExpenseStore, [], [["zustand/immer", never]]> =
  immer<ExpenseStore, [], []>((set, get, storeApi) => {
    timer = setupDebounceTimer();
    const selectedMonth =
      localStorage.getItem(Constants.monthStorageKey) ??
      utils.formatToMonthYear(Date.now());

    return {
      monthYear: selectedMonth,
      persons: {},
      personIds: [],
      isConflictsFound: false,

      clearConflicts: () => {
        set((store) => {
          store.isConflictsFound = false;
          store.conflicts = [];
        });
      },
      setMonthYear: (monthYear: string) => {
        // save change considering: user is changing month
        timer.timeout();

        // caching before switching to different month
        inMemoryCache.setCache(
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
            .map((person) => ({ id: person._id, type: person.type }));
          patchProcessing.setPrevState(store.persons);
        });
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
              store.persons[person.id].version = ObjectId.getId();
              store.persons[person.id].index = index;
            }
          });
        });
      },
      updateName: (id, name) => {
        set((state) => {
          state.persons[id].version = ObjectId.getId();
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
              store.persons[person.id].version = ObjectId.getId();
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
          store.persons[personId].version = ObjectId.getId();
          const length = Object.keys(store.persons[personId].txs).length;
          const id = ObjectId.getId();
          store.persons[personId].txs[id] = { _id: id, index: length };
          store.persons[personId].txIds.push(id);
        });
      },
      deleteExpense: (id, personId) => {
        set((store) => {
          store.persons[personId].version = ObjectId.getId();
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
          store.persons[personId].version = ObjectId.getId();
          store.persons[personId].txs[id] = {
            ...store.persons[personId].txs[id],
            ...updates,
          };
        });
      },
      updateExpenseIndex: (id, index, personId) => {
        set((store) => {
          store.persons[personId].version = ObjectId.getId();
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
      // delayDebounceTimer action - delay the timer only if user is working
      if ((action as keyof ExpenseStore) === "delayDebounceTimer") {
        if (!timer.isRunning()) return;
      }
      // delay save
      timer.startOrDelay();
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

    const nextState = useExpenseStore.getState().persons;
    patchProcessing.processPatch(nextState, async (patches) => {
      if (utils.isPatchEmpty(patches)) return;
      console.log("processing patch: ", patches);
      await monthExpenseRepository.applyPatches(patches)?.then((conflicts) => {
        if (!conflicts?.data?.conflictPersons?.length) return;
        useExpenseStore.setState({
          isConflictsFound: true,
          conflicts: conflicts.data.conflictPersons,
        });
      });
    });
  });

  return timer;
}

export { timer };

export default useExpenseStore;

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("ExpenseStore", useExpenseStore);
}
