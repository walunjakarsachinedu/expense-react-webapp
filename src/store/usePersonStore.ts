import * as jsonpatch from "fast-json-patch";
import { produce } from "immer";
import { mountStoreDevtool } from "simple-zustand-devtools";
import { v4 } from "uuid";
import { create, StateCreator } from "zustand";
import applyMiddleware from "../middleware/core/applyMiddleware";
import { Person } from "../models/Person";
import Tx from "../models/Tx";
import { Prettify } from "../types/Prettify";
import { TableType } from "../types/Transaction";
import Timer from "../utils/Timer";
import { utils } from "../utils/Utility";
import MonthExpenseRepository from "../api/MonthExpenseRepository";

export type ExpenseStore = {
  monthYear: string;
  persons: Record<string, Person>;
  personIds: string[]; // for maintaining order

  setMonthData: (monthYear: string, persons: Person[]) => void;
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

const personStore: StateCreator<ExpenseStore, [], []> = (
  set,
  get,
  storeApi
) => {
  timer = setupDebounceTimer(get);
  return {
    monthYear: utils.formatToMonthYear(Date.now()),
    persons: {},
    personIds: [],
    setMonthData: (monthYear, persons) => {
      set(
        produce<ExpenseStore>((store) => {
          store.monthYear = monthYear;
          persons.forEach((person) => (store.persons[person._id] = person));
          store.personIds = persons
            .sort((a, b) => a.index - b.index)
            .map((person) => person._id);
        })
      );
    },
    addPerson: (type) =>
      set(
        produce<ExpenseStore>((store) => {
          const id = v4();
          const index = Object.keys(store.persons).length;
          store.persons[id] = {
            _id: v4(),
            index: index,
            name: "",
            txs: {},
            hash: v4(),
            txIds: [],
            month: utils.formatToMonthYear(Date.now()),
            type: type,
          };
          store.personIds.push(id);
        })
      ),
    deletePerson: (id) => {
      set(
        produce<ExpenseStore>((store) => {
          // removing person
          delete store.persons[id];
          store.personIds = store.personIds.filter(
            (personId) => personId != id
          );
          // syncing index from personIds with persons list
          store.personIds.forEach((id, index) => {
            if (store.persons[id].index != index) {
              store.persons[id].hash = v4();
              store.persons[id].index = index;
            }
          });
        })
      );
    },
    updateName: (id, name) => {
      set(
        produce((store) => {
          store.persons[id].hash = v4();
          store.persons[id].name = name;
        })
      );
    },
    updatePersonIndex: (id, index) => {
      set(
        produce<ExpenseStore>((store) => {
          // removing from old index
          store.personIds = store.personIds.filter(
            (personId) => personId != id
          );
          // place to new index
          store.personIds.splice(index, 0, id);
          // syncing index from personIds with persons list
          store.personIds.forEach((id, index) => {
            if (store.persons[id].index != index) {
              store.persons[id].hash = v4();
              store.persons[id].index = index;
            }
          });
        })
      );
    },
    copyPerson: (id) => {
      const textToCopy = utils.personToString(get().persons[id]);
      navigator.clipboard.writeText(textToCopy);
    },
    addExpense: (personId) => {
      set(
        produce<ExpenseStore>((store) => {
          store.persons[personId].hash = v4();
          const length = Object.keys(store.persons[personId].txs).length;
          const id = v4();
          store.persons[personId].txs[id] = { _id: id, index: length };
          store.persons[personId].txIds.push(id);
        })
      );
    },
    deleteExpense: (id, personId) => {
      set(
        produce<ExpenseStore>((store) => {
          store.persons[personId].hash = v4();
          const person = store.persons[personId];
          // removing tx
          delete person.txs[id];
          person.txIds = person.txIds.filter((txId) => txId != id);
          // syncing index from txIds with txs list
          person.txIds.forEach((id, index) => (person.txs[id].index = index));
        })
      );
    },
    updateExpense: (id: string, personId, updates) => {
      set(
        produce<ExpenseStore>((store) => {
          store.persons[personId].hash = v4();
          store.persons[personId].txs[id] = {
            ...store.persons[personId].txs[id],
            ...updates,
          };
        })
      );
    },
    updateExpenseIndex: (id, index, personId) => {
      set(
        produce<ExpenseStore>((store) => {
          store.persons[personId].hash = v4();
          const person = store.persons[personId];
          // removing from old index
          person.txIds = person.txIds.filter((txId) => txId != id);
          // adding to new index
          person.txIds.splice(index, 0, id);
          // syncing index from txIds with txs list
          person.txIds.forEach((id, index) => (person.txs[id].index = index));
        })
      );
    },
    /** used by middleware to delay debounce timer */
    delayDebounceTimer: () => {},
  };
};

const useExpenseStore = create<ExpenseStore>(
  applyMiddleware({
    store: personStore,
    beforeMiddlware: (action) => {
      const ignoreActions: (keyof ExpenseStore)[] = [
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

function setupDebounceTimer(get: () => ExpenseStore): Timer {
  const timer = new Timer({
    debounceTime: 1500,
    thresholdTime: 10000,
    stopTimerOnWindowBlur: true,
  });

  let expenseStore: ExpenseStore;

  timer.startEvent.subscribe(() => {
    expenseStore = get();
  });

  timer.stopEvent.subscribe(() => {
    // todo: use jsonpatch to send batch of patch of changes
    console.info("saving data to local storage");
    const persons = Object.values(get().persons);
    const oldPersons = Object.values(expenseStore.persons);
    const deletedPersons = oldPersons.filter(
      (person) => !persons.some((oldPerson) => oldPerson._id == person._id)
    );
    MonthExpenseRepository.provider.deletePersonData(deletedPersons);
    MonthExpenseRepository.provider.storePersonData(persons);
  });

  return timer;
}

export default useExpenseStore;

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("ExpenseStore", useExpenseStore);
}
