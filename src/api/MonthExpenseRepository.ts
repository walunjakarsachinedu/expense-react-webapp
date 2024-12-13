import hash from "object-hash";
import { dummyPersonTx } from "../DummyData";
import { PersonTx } from "../types/Transaction";
import { utils } from "../utils/Utility";
import { DummyBackendApi } from "./DummyBackendApi";
import { Person } from "../models/Person";
import PersonCacheApi from "./PersonCacheApi";

/** contains backend, cache interaction for operation related to month based transactions. */
export default class MonthExpenseRepository {
  static readonly provider = new MonthExpenseRepository();

  async getMonthExpense(): Promise<Person[]> {
    // TODO: logic to populate month & year
    const fetchIdHashes = await this.getMonthExpenseIdHash();
    /** person data found in local storage. */
    const storedPersons: Person[] = fetchIdHashes
      .map((personIdHash) => PersonCacheApi.provider.getPerson(personIdHash))
      .filter((person) => person != undefined);

    /** person hash not found in local storage. */
    const notFoundIdHashes = fetchIdHashes.filter(
      (fetchedPerson) =>
        !storedPersons.some(
          (storedPerson) =>
            storedPerson._id == fetchedPerson._id &&
            storedPerson.hash == fetchedPerson.hash
        )
    );

    /** person data fetched from backend. */
    const fetchedPerson = await this.getMonthExpenseByIds(
      notFoundIdHashes.map((person) => person._id)
    ).then((persons) => persons.map<Person>(utils.personTxToPerson));

    /** caching fetched data */
    fetchedPerson.forEach((person) =>
      PersonCacheApi.provider.storePerson(person)
    );

    return [...storedPersons, ...fetchedPerson].map((person) => ({
      ...person,
      txIds: person.txIds.sort(),
    }));
  }

  async getMonthExpenseByIds(personIds: string[]): Promise<PersonTx[]> {
    const data = DummyBackendApi.provider.getPersonByIds(personIds);
    return data.length == 0
      ? dummyPersonTx.filter((person) => personIds.includes(person._id))
      : data;
  }

  async getMonthExpenseIdHash(): Promise<{ hash: string; _id: string }[]> {
    const data = DummyBackendApi.provider.getPersonHashIds("12-2024");

    return data.length == 0
      ? dummyPersonTx.map((person) => ({
          hash: person.hash ?? hash(utils.personTxToPerson(person)),
          _id: person._id,
        }))
      : data;
  }

  async storePersonData(personData: Person[]) {
    PersonCacheApi.provider.storePersonData(personData);
    DummyBackendApi.provider.storePersonData(personData);
  }

  async deletePersonData(personData: Person[]) {
    PersonCacheApi.provider.deletePersonData(personData);
    DummyBackendApi.provider.deletePersonData(personData);
  }
}
