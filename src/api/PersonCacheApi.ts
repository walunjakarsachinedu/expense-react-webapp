import { Operation } from "fast-json-patch";
import { Person } from "../models/Person";
import ApplyPatches from "../utils/ApplyPatches";

export default class PersonCacheApi extends ApplyPatches {
  static readonly provider = new PersonCacheApi();

  readonly storageKey = "cached_person_id_";
  _getKeyFromId = (id: string) => `${this.storageKey}${id}`;

  getAllPersons = (): Person[] => {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storageKey))
      .map((id) => localStorage.getItem(id))
      .map((data) => JSON.parse(data!));
  };

  deletePersonWithId = (id: string) => {
    localStorage.removeItem(this._getKeyFromId(id));
  };

  storePerson = (person: Person) => {
    localStorage.setItem(
      this._getKeyFromId(person._id),
      JSON.stringify({ ...person })
    );
  };

  /**
   * Apply patch and use new state to store - updation, deletion, addition.
   */
  applyChanges(patches: Operation[]) {
    let personMap = this.getAllPersons().reduce<Record<string, Person>>(
      (acc, cur) => {
        acc[cur._id] = cur;
        return acc;
      },
      {} as Record<string, Person>
    );
    const idList = Object.keys(personMap);
    personMap = this.applyPatches(patches, personMap);
    const updatedIdList = Object.keys(personMap);
    // updation + addition
    Object.values(personMap).forEach((person) => this.storePerson(person));
    // deletion
    idList
      .filter((id) => !updatedIdList.includes(id))
      .forEach(this.deletePersonWithId);
  }
}
