import { PersonData, PersonDiff } from "../../models/type";
import useExpenseStore from "../../store/usePersonStore";

/** Cache data in local storage. */
class PersonCacheApi {
  readonly storageKey = "cached_person_id_";
  _getKeyFromId = (id: string) => `${this.storageKey}${id}`;

  getAllPersons = (): PersonData[] => {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storageKey))
      .map((id) => localStorage.getItem(id))
      .map((data) => JSON.parse(data!));
  };

  deletePersonWithId = (id: string) => {
    localStorage.removeItem(this._getKeyFromId(id));
  };

  clear() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storageKey))
      .forEach((key) => localStorage.removeItem(key));
  }

  storePerson = (person: PersonData) => {
    localStorage.setItem(
      this._getKeyFromId(person._id),
      JSON.stringify({ ...person })
    );
  };

  /**
   * Apply patch - updation, deletion, addition.
   */
  applyChanges(patches: PersonDiff) {
    const persons = useExpenseStore.getState().persons;
    patches.added?.forEach((person) => this.storePerson(persons[person._id]));
    patches.updated?.forEach((person) => this.storePerson(persons[person._id]));
    patches.deleted?.map(this.deletePersonWithId);
  }
}

/** Cache data in local storage. */
export const personCacheApi = new PersonCacheApi();
