import { v4 } from "uuid";
import { create } from "zustand";
import { Person } from "../models/Person";
import Tx from "../models/Tx";
import { TableType } from "../types/Transaction";
import { Prettify } from "../types/Prettify";
import { utils } from "../utils/Utility";

type PersonStore = {
  monthYear: string;
  persons: Person[];
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

const usePersonStore = create<PersonStore>((set) => {
  const updatePersonWithId = (
    id: string,
    personList: Person[],
    update: (person: Person) => Person
  ) => {
    return personList.map((person) =>
      person._id === id ? update(person) : person
    );
  };

  const updateTxs = (
    id: string,
    personList: Person[],
    update: (txs: Tx[]) => Tx[]
  ): Person[] => {
    return updatePersonWithId(id, personList, (person) => ({
      ...person,
      txs: update(person.txs),
    }));
  };

  return {
    monthYear: utils.formatToMonthYear(Date.now()),
    persons: [],
    addPerson: (type) => {
      set((store) => ({
        persons: [
          ...store.persons,
          { _id: v4(), index: store.persons.length, name: "", txs: [], type },
        ],
      }));
    },
    deletePerson: (id) => {
      set((store) => ({
        persons: store.persons.filter((person) => person._id !== id),
      }));
    },
    updateName: (id, name) => {
      set((store) => ({
        persons: updatePersonWithId(id, store.persons, (person) => ({
          ...person,
          name,
        })),
      }));
    },
    updatePersonIndex: (id, index) => {
      set((store) => ({
        persons: updatePersonWithId(id, store.persons, (person) => ({
          ...person,
          index,
        }))
          .sort((a, b) => a.index - b.index)
          .map((person, index) => ({ ...person, index })),
      }));
    },

    addExpense: (personId) => {
      set((store) => ({
        persons: updateTxs(personId, store.persons, (txs) => [
          ...txs,
          { _id: v4(), index: txs.length },
        ]),
      }));
    },
    deleteExpense: (id, personId) => {
      set((store) => ({
        persons: updateTxs(personId, store.persons, (txs) =>
          txs.filter((tx) => tx._id !== id)
        ),
      }));
    },
    updateExpense: (id: string, personId, updates) => {
      set((store) => ({
        persons: updateTxs(personId, store.persons, (txs) =>
          txs.map((tx) => (tx._id === id ? { ...tx, ...updates } : tx))
        ),
      }));
    },
    updateExpenseIndex: (id, index, personId) => {
      set((store) => ({
        persons: updateTxs(personId, store.persons, (txs) =>
          txs
            .map((tx) => (tx._id === id ? { ...tx, index } : tx))
            .sort((a, b) => a.index - b.index)
            .map((tx, index) => ({ ...tx, index }))
        ),
      }));
    },
  };
});

export default usePersonStore;
