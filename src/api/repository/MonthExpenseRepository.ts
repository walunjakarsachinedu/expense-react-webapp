import {
  Conflicts,
  PersonData,
  PersonDiff,
  PersonVersionId,
  ResponseData,
} from "../../models/type";
import { patchProcessing } from "../../utils/PatchProcessing";
import personUtils from "../../utils/personUtils";
import { ExpenseBackendApi } from "../services/ExpenseBackendApi";
import {
  inMemoryCache,
  InMemoryCacheCategory,
} from "../cache/InMemoryCacheApi";
import { personCacheApi } from "../cache/PersonCacheApi";

/** contains backend, cache interaction for operation related to month based transactions. */
class MonthExpenseRepository {
  /**
   * Algorithm :-
   * 1. send pending patch
   * 2. if cache for data found, then return data from cache
   * 3. fetch cache & changed persons
   * 4. remove un-used persons from cache
   * 5. store updated & added persons from cache
   * 6. merge changed persons with cache
   */
  async getMonthExpense(monthYear: string): Promise<PersonData[]> {
    // 1. send pending patch
    await patchProcessing.processPatchFromStorage(async (patches) => {
      await monthExpenseRepository.applyPatches(patches);
    });

    // 2. if cache for data found, then return data from cache
    const cachedPersonData = inMemoryCache.getCache<PersonData[]>(
      InMemoryCacheCategory.PersonMonthlyData,
      monthYear
    );
    if (cachedPersonData) return cachedPersonData;

    // 3. fetch cache & changed persons
    const persons: PersonData[] = personCacheApi.getAllPersons();

    const personVersionIds: PersonVersionId[] = persons.map((person) => ({
      _id: person._id,
      version: person.version,
    }));

    const changedPersons = await ExpenseBackendApi.provider
      .getChangedPersons(monthYear, personVersionIds)
      .then((result) => result.data!);

    const cachedPersons = persons.filter(
      (person) =>
        !changedPersons.updatedPersons.find(({ _id }) => _id == person._id) &&
        !changedPersons.deletedPersons.find((id) => id == person._id)
    );

    const addedPersons = changedPersons.addedPersons.map(
      personUtils.personTxToPerson
    );
    const updatedPersons = changedPersons.updatedPersons.map(
      personUtils.personTxToPerson
    );

    // 4. remove un-used persons from cache
    changedPersons.deletedPersons.forEach(personCacheApi.deletePersonWithId);

    // 5. store updated & added persons from cache
    [...changedPersons.updatedPersons, ...changedPersons.addedPersons]
      .map(personUtils.personTxToPerson)
      .forEach(personCacheApi.storePerson);

    // 6. merge changed persons with cache
    return [...cachedPersons, ...addedPersons, ...updatedPersons]
      .map((person) => {
        person.txIds.forEach((id, index) => (person.txs[id].index = index));
        return person;
      })
      .sort((person) => person.index - person.index);
  }

  async storePersonData(personData: PersonData[]) {
    personData.forEach((person) => personCacheApi.storePerson(person));
  }

  async deletePersonData(personData: PersonData[]) {
    personData
      .map((person) => person._id)
      .forEach(personCacheApi.deletePersonWithId);
  }

  async applyPatches(patches: PersonDiff): ResponseData<Conflicts> {
    personCacheApi.applyChanges(patches);
    return ExpenseBackendApi.provider.applyChanges(patches);
  }

  _isIdVersionEqual = (a: PersonVersionId, b: PersonVersionId): boolean => {
    return a._id == b._id && a.version == b.version;
  };
}

export const monthExpenseRepository = new MonthExpenseRepository();
