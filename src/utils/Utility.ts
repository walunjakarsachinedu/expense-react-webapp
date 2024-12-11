import hash from "object-hash";
import { Person } from "../models/Person";
import Tx from "../models/Tx";
import { PersonTx } from "../types/Transaction";

export default class Utility {
  static readonly provider = new Utility();

  parseNumber(numStr?: string): number | undefined {
    try {
      if (numStr) {
        return parseInt(numStr);
      }
    } catch {
      // error
    }
  }

  formatToMonthYear(timestamp: number): string {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensure 2-digit month
    const year = date.getFullYear().toString(); // Get the full year
    return `${month}-${year}`;
  }

  personToString(person: Person): string {
    const { name, txIds, txs } = person;
    const total = Object.values(txs).reduce(
      (t, tx) => t + (utils.parseNumber(tx.money) ?? 0),
      0
    );

    let result = `Name: ${name}\nTotal: ${total}/-\n\nTransactions:`;

    txIds.forEach((id, index) => {
      const { money = "N/A", tag = "N/A" } = txs[id] || {};
      result += `\n${money} - ${tag}`;
    });

    return result;
  }

  personTxToPerson(person: PersonTx): Person {
    return {
      ...person,
      txs: person.txs.reduce<Record<string, Tx>>(
        (txMap, tx) => ({ ...txMap, [tx._id]: tx }),
        {}
      ),
      txIds: person.txs.sort((a, b) => a.index - b.index).map((tx) => tx._id),
    };
  }

  personStoragePrefix = "person_id_";
  getPersonStorageKey = (person: { _id: string }) =>
    `${this.personStoragePrefix}${person._id}`;

  storePerson = (person: Person) => {
    localStorage.setItem(
      this.getPersonStorageKey(person),
      JSON.stringify(person.hash ? person : { ...person, hash: hash(person) })
    );
  };

  getPerson = (personIdHash: {
    _id: string;
    hash: string;
  }): Person | undefined => {
    if (!localStorage.getItem(this.getPersonStorageKey(personIdHash))) return;
    const localPerson = JSON.parse(
      localStorage.getItem(this.getPersonStorageKey(personIdHash))!
    ) as Person;
    if (personIdHash.hash == localPerson?.hash) {
      return localPerson;
    } else {
      localStorage.removeItem(this.getPersonStorageKey(personIdHash));
    }
  };
}

export const utils = new Utility();
