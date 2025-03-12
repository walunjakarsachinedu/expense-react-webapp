import { PersonData, PersonDiff, PersonPatch } from "../models/type";
import personUtils from "../utils/personUtils";

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
    const personMap = [
      // filter out deleted persons
      ...this.getAllPersons().filter(
        (person) =>
          !patches.deleted || !patches.deleted.find((_id) => _id == person._id)
      ),
      // include added persons
      ...(patches.added?.map(personUtils.personTxToPerson) ?? []),
    ].reduce<Record<string, PersonData>>((acc, cur) => {
      acc[cur._id] = cur;
      return acc;
    }, {} as Record<string, PersonData>);

    patches.updated?.forEach((update: PersonPatch) => {
      // applying person update
      personMap[update._id] = {
        ...personMap[update._id],
        ...{ ...update, txDiff: undefined },
      };

      const person = personMap[update._id];

      // applying tx updates
      update.txDiff?.added?.forEach((tx) => (person.txs[tx._id] = tx));
      update.txDiff?.deleted?.forEach((txId) => delete person.txs[txId]);
      update.txDiff?.updated?.forEach((txPatch) => {
        person.txs[txPatch._id] = {
          ...person.txs[txPatch._id],
          ...txPatch,
        };
      });
      // setting order with updated tx
      person.txIds = Object.values(person.txs)
        .sort((a, b) => a.index - b.index)
        .map(({ _id }) => _id);
    });

    // store cache
    Object.values(personMap).forEach(personCacheApi.storePerson);
  }
}

export const personCacheApi = new PersonCacheApi();
