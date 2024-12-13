import hash from "object-hash";
import { Person } from "../models/Person";

export default class PersonCacheApi {
  static readonly provider = new PersonCacheApi();

  storageKey = "person_id_";
  _getKey = (person: { _id: string }) => `${this.storageKey}${person._id}`;

  storePersonData(person: Person[]) {
    person.forEach((person) => this.storePerson(person));
  }

  storePerson = (person: Person) => {
    localStorage.setItem(
      this._getKey(person),
      JSON.stringify({ ...person, hash: hash({ ...person, hash: undefined }) })
    );
  };

  deletePersonData(person: Person[]) {
    person.forEach((person) => localStorage.removeItem(this._getKey(person)));
  }

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
}
