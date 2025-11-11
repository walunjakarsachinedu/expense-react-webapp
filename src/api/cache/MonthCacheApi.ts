import { produce } from "immer";
import { PersonData, MonthDiff, MonthData, MonthlyNotes } from "../../models/type";
import useExpenseStore from "../../store/usePersonStore";
import personUtils from "../../utils/personUtils";
import utils from "../../utils/utils";
import Constants from "../../utils/constants";

/** Cache data in local storage. */
class MonthCacheApi {
  readonly storageKey = "cache/month";
  readonly personStorageKey = `${this.storageKey}/person`;
  readonly monthlyNotesKey = `${this.storageKey}/monthlyNotes`;
  /** Represent monthYear the data in cache corresponds to. */
  readonly cachedMonthYearKey = `${this.storageKey}/cachedMonthYear`; 

  /** @return key for storing person. */
  private _getPersonKey = (id: string) => `${this.personStorageKey}/${id}`;

  getMonthData = (): MonthData => {
    return {
      persons: utils.toMapById(this._getAllPersons()),
      monthlyNotes: this.getMonthlyNotes()
    }
  }

  private _getAllPersons = (): PersonData[] => {
    return Object.keys(localStorage)
      .filter((key) => key.startsWith(this.personStorageKey))
      .map((id) => localStorage.getItem(id))
      .map((data) => JSON.parse(data!) as PersonData)
      .map(personUtils.sanitizePerson);
  };

  deletePersonWithId = (id: string) => {
    localStorage.removeItem(this._getPersonKey(id));
  };

  /** clear data of current month from cache. */
  clear() {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(this.storageKey))
      .forEach((key) => localStorage.removeItem(key));
  }

  storePerson = (person: PersonData) => {
    person = produce(person, personUtils.sanitizePerson);
    localStorage.setItem(
      this._getPersonKey(person._id),
      JSON.stringify({ ...person })
    );
  };

  /**
   * Apply patch - updation, deletion, addition.
   */
  applyChanges(patches: {
    added?: {_id: string}[], 
    updated?: {_id: string}[], 
    deleted?: string[], 
    monthlyNotes?: MonthlyNotes
  }) {
    const persons = useExpenseStore.getState().persons;
    patches.added?.forEach((person) => this.storePerson(persons[person._id]));
    patches.updated?.forEach((person) => this.storePerson(persons[person._id]));
    patches.deleted?.map(this.deletePersonWithId);

    this.storeMonthlyNotes(patches.monthlyNotes);
  }

  getMonthlyNotes = (): MonthlyNotes|undefined => {
    try {
      const monthlyNotes: MonthlyNotes = JSON.parse(localStorage.getItem(this.monthlyNotesKey) ?? "{}");
      if("notes" in monthlyNotes && "version" in monthlyNotes) {
        return monthlyNotes;
      }
    }
    catch {
      // ignore error
    }
  }

  storeMonthlyNotes = (monthlyNotes: MonthlyNotes|undefined) => {
    if(!monthlyNotes) return;
    localStorage.setItem(this.monthlyNotesKey, JSON.stringify(monthlyNotes));
  }

  setCacheMonthYear(monthYear: string) {
    localStorage.setItem(this.cachedMonthYearKey, monthYear);
  }

  isMonthCached(): boolean {
    return !!localStorage.getItem(this.cachedMonthYearKey) 
      && !!localStorage.getItem(Constants.monthStorageKey) 
      && localStorage.getItem(this.cachedMonthYearKey) == localStorage.getItem(Constants.monthStorageKey); 
  }

  cacheMonthData(monthYear: string, monthData: MonthData) {
    if(this.isMonthCached()) return;

    this.clear();

    Object.values(monthData.persons).forEach(
      (person) => this.storePerson(person)
    )
    this.storeMonthlyNotes(monthData.monthlyNotes);

    this.setCacheMonthYear(monthYear);
    localStorage.setItem(Constants.monthStorageKey, monthYear);
  }
}

/** Cache data in local storage. */
export const monthCacheApi = new MonthCacheApi();
