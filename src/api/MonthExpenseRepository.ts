import { Operation } from "fast-json-patch";
import { dummyPersonTx } from "../DummyData";
import { Person, PersonTx } from "../models/Person";
import personUtils from "../utils/personUtils";
import { DummyBackendApi } from "./DummyBackendApi";
import PersonCacheApi from "./PersonCacheApi";

/** contains backend, cache interaction for operation related to month based transactions. */
export default class MonthExpenseRepository {
  static readonly provider = new MonthExpenseRepository();

  /**
   * Algorithm :-
   * 1. fetch person id+hash from backend & id+hash+data from cache.
   * 2. fetch un-cache persons from backend, store in cache.
   * 3. delete un-used persons from cache.
   * @return array of fetched + cached persons
   */
  async getMonthExpense(): Promise<Person[]> {
    // TODO: logic to populate month & year
    const fetchIdHashes = await this.getMonthExpenseIdHash();
    const cachedPersonList: Person[] = PersonCacheApi.provider.getAllPersons();

    // Fetching persons which not found in cache
    const fetchedPersons = await this.getMonthExpenseByIds(
      fetchIdHashes
        .filter(
          (idHash) =>
            !cachedPersonList.some((person) =>
              this._compareIdHash(person, idHash)
            )
        )
        .map((person) => person._id)
    ).then((persons) => persons.map<Person>(personUtils.personTxToPerson));

    // Extracting Persons found in cache
    const cachePersons = cachedPersonList.filter((person) =>
      fetchIdHashes.find((idHash) => this._compareIdHash(person, idHash))
    );

    /** deleting un-necessary cache */
    cachedPersonList
      .filter(
        (person) =>
          !fetchIdHashes.some((idHash) => this._compareIdHash(person, idHash))
      )
      .map((idHash) => idHash._id)
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

  async getMonthExpenseByIds(personIds: string[]): Promise<PersonTx[]> {
    const data = DummyBackendApi.provider.getPersonByIds(personIds);
    return data.length == 0
      ? dummyPersonTx.filter((person) => personIds.includes(person._id))
      : data;
  }

  async getMonthExpenseIdHash(): Promise<{ hash: string; _id: string }[]> {
    const data = DummyBackendApi.provider.getPersonHashIds("01-2025");
    if (data.length == 0) {
      DummyBackendApi.provider.storePersonData(
        dummyPersonTx.map(personUtils.personTxToPerson)
      );
    }
    // TODO: remove when data get from proper backend
    if (data.length == 0) {
      return dummyPersonTx.map((person) => ({
        hash: person.hash,
        _id: person._id,
      }));
    }

    return data;
  }

  async storePersonData(personData: Person[]) {
    personData.forEach((person) => PersonCacheApi.provider.storePerson(person));
    DummyBackendApi.provider.storePersonData(personData);
  }

  async deletePersonData(personData: Person[]) {
    personData
      .map((person) => person._id)
      .forEach(PersonCacheApi.provider.deletePersonWithId);
    DummyBackendApi.provider.deletePersonData(personData);
  }

  async applyPatches(patches: Operation[]) {
    PersonCacheApi.provider.applyChanges(patches);
    DummyBackendApi.provider.applyChanges(patches);
  }

  _compareIdHash = (
    a: { _id: string; hash: string },
    b: { _id: string; hash: string }
  ): boolean => a._id == b._id && a.hash == b.hash;
}
