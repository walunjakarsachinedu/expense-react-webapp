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
};

let startOrDelay: () => void;

const personStore: StateCreator<ExpenseStore, [], []> = (
  set,
  get,
  storeApi
) => {
  startOrDelay = setupDebounceTimer(get);
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
            txIds: [],
            type,
          };
          store.personIds.push(id);
        })
      ),
    deletePerson: (id) => {
      set(
        produce<ExpenseStore>((store) => {
          delete store.persons[id];
          store.personIds = store.personIds.filter(
            (personId) => personId != id
          );
        })
      );
    },
    updateName: (id, name) => {
      console.log("updating person name");
      set(
        produce((store) => {
          store.persons[id].name = name;
        })
      );
    },
    updatePersonIndex: (id, index) => {
      set(
        produce<ExpenseStore>((store) => {
          store.persons[id].index = index;
          store.personIds = Object.values(store.persons)
            .sort((a, b) => a.index - b.index)
            .map((person) => person._id);
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
          delete store.persons[personId].txs[id];
          store.persons[personId].txIds = store.persons[personId].txIds.filter(
            (txId) => txId != id
          );
        })
      );
    },
    updateExpense: (id: string, personId, updates) => {
      set(
        produce<ExpenseStore>((store) => {
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
          store.persons[personId].txs[id].index = index;
          store.persons[personId].txIds = Object.values(
            store.persons[personId].txs
          )
            .sort((a, b) => a.index - b.index)
            .map((tx) => tx._id);
        })
      );
    },
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
      // delay save
      startOrDelay();
    },
  })
);

function setupDebounceTimer(get: () => ExpenseStore): () => void {
  const timer = new Timer({
    debounceTime: 2000,
    thresholdTime: 10000,
    stopTimerOnWindowBlur: true,
  });

  let expenseStore: ExpenseStore;

  timer.startEvent.subscribe(() => {
    expenseStore = get();
  });

  timer.stopEvent.subscribe(() => {
    console.log(
      "compare",
      expenseStore,
      "with",
      get(),
      "is",
      jsonpatch.compare(expenseStore, get())
    );
  });

  return timer.startOrDelay;
}

export default useExpenseStore;

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("ExpenseStore", useExpenseStore);
}
