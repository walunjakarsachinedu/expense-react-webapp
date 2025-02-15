import {
  PersonData,
  PersonDiff,
  PersonDiffResponse,
  PersonMinimal,
} from "../models/type";
import personUtils from "../utils/personUtils";
import { ExpenseBackendApi } from "./ExpenseBackendApi";
import PersonCacheApi from "./PersonCacheApi";

/** contains backend, cache interaction for operation related to month based transactions. */
export default class MonthExpenseRepository {
  static readonly provider = new MonthExpenseRepository();

  /**
   * Algorithm :-
   * 1. fetch person id+version from backend & id+version+data from cache.
   * 2. fetch un-cache persons from backend, store in cache.
   * 3. delete un-used persons from cache.
   * @return array of fetched + cached persons
   */
  async getMonthExpense(): Promise<PersonData[]> {
    // TODO: logic to populate month & year
    const fetchIdVersions =
      await ExpenseBackendApi.provider.getPersonVersionIds("02-2025");
    const cachedPersonList: PersonData[] =
      PersonCacheApi.provider.getAllPersons();

    // Fetching persons which not found in cache
    const fetchedPersons = await ExpenseBackendApi.provider
      .getPersonByIds(
        fetchIdVersions
          .filter(
            (idVersion) =>
              !cachedPersonList.find((person) =>
                this._isIdVersionEqual(person, idVersion)
              )
          )
          .map((person) => person._id)
      )
      .then((persons) => persons.map<PersonData>(personUtils.personTxToPerson));

    // Extracting Persons found in cache
    const cachePersons = cachedPersonList.filter((person) =>
      fetchIdVersions.find((idVersion) =>
        this._isIdVersionEqual(person, idVersion)
      )
    );

    /** deleting un-necessary cache */
    cachedPersonList
      .filter(
        (person) =>
          !fetchIdVersions.find((idVersion) =>
            this._isIdVersionEqual(person, idVersion)
          )
      )
      .map((idVersion) => idVersion._id)
      .forEach(PersonCacheApi.provider.deletePersonWithId);

    /** caching un-cached fetched persons */
    fetchedPersons.forEach((person) =>
      PersonCacheApi.provider.storePerson(person)
    );

    return [...cachePersons, ...fetchedPersons]
      .map((person) => {
        person.txIds.forEach((id, index) => (person.txs[id].index = index));
        return person;
      })
      .sort((person) => person.index - person.index);
  }

  async storePersonData(personData: PersonData[]) {
    personData.forEach((person) => PersonCacheApi.provider.storePerson(person));
  }

  async deletePersonData(personData: PersonData[]) {
    personData
      .map((person) => person._id)
      .forEach(PersonCacheApi.provider.deletePersonWithId);
  }

  async applyPatches(
    patches: PersonDiff
  ): Promise<PersonDiffResponse | undefined> {
    PersonCacheApi.provider.applyChanges(patches);
    return ExpenseBackendApi.provider.applyChanges(patches);
  }

  _isIdVersionEqual = (a: PersonMinimal, b: PersonMinimal): boolean => {
    return a._id == b._id && a.version == b.version;
  };
}
