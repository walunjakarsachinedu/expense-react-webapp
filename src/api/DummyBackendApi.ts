import { Person } from "../models/Person";
import { PersonTx } from "../types/Transaction";
import { utils } from "../utils/Utility";

/** stores person as PersonTx structure in local */
interface IDummyBackendApi {
  getPersonHashIds(month: string): { _id: string; hash: string }[];
  getPersonByIds(ids: string[]): PersonTx[];
  storePersonData(persons: Person[]): void;
  deletePersonData(person: Person[]): void;
}

export class DummyBackendApi implements IDummyBackendApi {
  static readonly provider: IDummyBackendApi = new DummyBackendApi();

  storageKey = "backend_person_data_";

  getPersonHashIds(month: string): { _id: string; hash: string }[] {
    const keys: string[] = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(this.storageKey))
      .map((key) => JSON.parse(localStorage.getItem(key)!) as PersonTx)
      .filter((person) => person.month == month)
      .map((person) => person as { _id: string; hash: string });
  }

  getPersonByIds(ids: string[]): PersonTx[] {
    return ids
      .map((id) => localStorage.getItem(this._getKey(id)))
      .map((data) => (data ? (JSON.parse(data)! as PersonTx) : undefined))
      .filter((data) => !!data);
  }

  storePersonData(persons: Person[]): void {
    persons
      .map((person) => utils.personToPersonTx(person))
      .forEach((person) =>
        localStorage.setItem(this._getKey(person._id), JSON.stringify(person))
      );
  }

  deletePersonData(persons: Person[]): void {
    persons.forEach((person) =>
      localStorage.removeItem(this._getKey(person._id))
    );
  }

  _getKey(id: string): string {
    return `${this.storageKey}${id}`;
  }
}
