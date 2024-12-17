import { Operation } from "fast-json-patch";
import { Person } from "../models/Person";
import ApplyPatches from "../utils/ApplyPatches";

export default class PersonCacheApi extends ApplyPatches {
  static readonly provider = new PersonCacheApi();

  readonly storageKey = "person_id_";
  _getKey = (person: { _id: string }) => `${this.storageKey}${person._id}`;

  storePersonData(person: Person[]) {
    person.forEach((person) => this.storePerson(person));
  }

  storePerson = (person: Person) => {
    localStorage.setItem(this._getKey(person), JSON.stringify({ ...person }));
  };

  deleteUnecessaryCache = (fetchedPersonIds: string[]) => {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storageKey))
      .filter(
        (key) =>
          !fetchedPersonIds.some(
            (personId) => this._getKey({ _id: personId }) == key
          )
      )
      .forEach((key) => localStorage.removeItem(key));
  };

  deletePersonData = (person: Person[]) => {
    person.forEach((person) => localStorage.removeItem(this._getKey(person)));
  };

  getPerson = (personIdHash: {
    _id: string;
    hash: string;
  }): Person | undefined => {
    if (!localStorage.getItem(this._getKey(personIdHash))) return;
    const localPerson = JSON.parse(
      localStorage.getItem(this._getKey(personIdHash))!
    ) as Person;
    if (personIdHash.hash == localPerson?.hash) {
      return localPerson;
    } else {
      localStorage.removeItem(this._getKey(personIdHash));
    }
  };

  applyChanges(patches: Operation[]) {
    let persons = Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storageKey))
      .map((key) => JSON.parse(localStorage.getItem(key)!) as Person)
      .reduce<Record<string, Person>>((acc, cur) => {
        acc[cur._id] = cur;
        return acc;
      }, {} as Record<string, Person>);
    persons = this.applyPatches(patches, persons);
    this.storePersonData(Object.values(persons));
  }
}
