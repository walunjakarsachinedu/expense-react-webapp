import { v4 } from "uuid";
import { create } from "zustand";
import { Person } from "../models/Person";
import { Prettify } from "../types/Prettify";
import { TableType } from "../types/Transaction";
import { utils } from "../utils/Utility";
import { produce, produceWithPatches } from "immer";
import Tx from "../models/Tx";
import { mountStoreDevtool } from "simple-zustand-devtools";

type ExpenseStore = {
  monthYear: string;
  persons: Record<string, Person>;
  personIds: string[]; // for maintaining order

  setMonthData: (monthYear: string, persons: Person[]) => void;
  addPerson: (type: TableType) => void;
  deletePerson: (id: string) => void;
  updateName: (id: string, name: string) => void;
  updatePersonIndex: (id: string, index: number) => void;

  addExpense: (personId: string) => void;
  deleteExpense: (id: string, personId: string) => void;
  updateExpense: (
    id: string,
    personId: string,
    tx: Prettify<Omit<Tx, "_id" | "index">>
  ) => void;
  updateExpenseIndex: (id: string, index: number, personId: string) => void;
};

const useExpenseStore = create<ExpenseStore>((set) => {
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
});

export default useExpenseStore;

if (process.env.NODE_ENV === "development") {
  mountStoreDevtool("ExpenseStore", useExpenseStore);
}
