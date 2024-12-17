import { Operation } from "fast-json-patch";
import { Person, PersonTx } from "../models/Person";
import ApplyPatches from "../utils/ApplyPatches";
import personUtils from "../utils/personUtils";

/** stores person as PersonTx structure in local */
interface IDummyBackendApi {
  getPersonHashIds(month: string): { _id: string; hash: string }[];
  getPersonByIds(ids: string[]): PersonTx[];
  storePersonData(persons: Person[]): void;
  deletePersonData(person: Person[]): void;
  applyChanges(patches: Operation[]): void;
}

export class DummyBackendApi extends ApplyPatches implements IDummyBackendApi {
  static readonly provider: IDummyBackendApi = new DummyBackendApi();

  readonly storageKey = "backend_person_data_";

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
      .map((person) => personUtils.personToPersonTx(person))
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

  applyChanges(patches: Operation[]) {
    let persons = Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storageKey))
      .map((key) => JSON.parse(localStorage.getItem(key)!) as PersonTx)
      .map((person) => personUtils.personTxToPerson(person))
      .reduce<Record<string, Person>>((acc, cur) => {
        acc[cur._id] = cur;
        return acc;
      }, {} as Record<string, Person>);
    const oldPersonIds = Object.keys(persons);
    persons = this.applyPatches(patches, persons);
    oldPersonIds
      .filter((id) => !persons[id])
      .forEach((id) => localStorage.removeItem(this._getKey(id)));
    this.storePersonData(Object.values(persons));
  }
}
