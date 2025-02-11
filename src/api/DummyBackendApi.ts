import {
  PersonData,
  PersonDiff,
  PersonMinimal,
  PersonTx,
} from "../models/type";
import personUtils from "../utils/personUtils";

/** stores person as PersonTx structure in local */
interface IDummyBackendApi {
  getPersonHashIds(month: string): PersonMinimal[];
  getPersonByIds(ids: string[]): PersonTx[];
  storePersonData(persons: PersonData[]): void;
  deletePersonData(person: PersonData[]): void;
  applyChanges(patches: PersonDiff): void;
}

export class DummyBackendApi implements IDummyBackendApi {
  static readonly provider: IDummyBackendApi = new DummyBackendApi();

  readonly storageKey = "backend_person_data_";

  getPersonHashIds(month: string): PersonMinimal[] {
    const keys: string[] = Object.keys(localStorage);
    return keys
      .filter((key) => key.startsWith(this.storageKey))
      .map((key) => JSON.parse(localStorage.getItem(key)!) as PersonTx)
      .filter((person) => person.month == month)
      .map((person) => person as PersonMinimal);
  }

  getPersonByIds(ids: string[]): PersonTx[] {
    return ids
      .map((id) => localStorage.getItem(this._getKey(id)))
      .map((data) => (data ? (JSON.parse(data)! as PersonTx) : undefined))
      .filter((data) => !!data);
  }

  storePersonData(persons: PersonData[]): void {
    persons
      .map((person) => personUtils.personToPersonTx(person))
      .forEach((person) =>
        localStorage.setItem(this._getKey(person._id), JSON.stringify(person))
      );
  }

  deletePersonData(persons: PersonData[]): void {
    persons.forEach((person) =>
      localStorage.removeItem(this._getKey(person._id))
    );
  }

  _getKey(id: string): string {
    return `${this.storageKey}${id}`;
  }

  applyChanges(patches: PersonDiff) {
    // send patch to backend
    // let persons = Object.keys(localStorage)
    //   .filter((key) => key.startsWith(this.storageKey))
    //   .map((key) => JSON.parse(localStorage.getItem(key)!) as PersonTx)
    //   .map((person) => personUtils.personTxToPerson(person))
    //   .reduce<Record<string, PersonData>>((acc, cur) => {
    //     acc[cur._id] = cur;
    //     return acc;
    //   }, {} as Record<string, PersonData>);
    // const oldPersonIds = Object.keys(persons);
    // persons = this.applyPatches(patches, persons);
    // oldPersonIds
    //   .filter((id) => !persons[id])
    //   .forEach((id) => localStorage.removeItem(this._getKey(id)));
    // this.storePersonData(Object.values(persons));
  }
}
