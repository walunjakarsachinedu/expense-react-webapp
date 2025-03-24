import {
  PersonData,
  PersonDiff,
  PersonPatch,
  PersonTx,
  Tx,
  TxPatch,
  TxType,
} from "../models/type";
import utils from "./utils";

class PersonUtils {
  personToString(person: PersonData): string {
    const { name, txIds, txs } = person;
    const total = Object.values(txs).reduce((t, tx) => t + (tx.money ?? 0), 0);

    let result = `Name: ${name}\nTotal: ${total}/-\n\nTransactions:`;

    txIds.forEach((id, index) => {
      const { money = "N/A", tag = "N/A" } = txs[id] || {};
      result += `\n${money} - ${tag}`;
    });

    return result;
  }

  // object is frozen
  personTxToPerson(person: PersonTx): PersonData {
    return {
      ...person,
      txs: person.txs.reduce<Record<string, Tx>>(
        (txMap, tx) => ({ ...txMap, [tx._id]: tx }),
        {}
      ),
      txIds: person.txs.sort((a, b) => a.index - b.index).map((tx) => tx._id),
    };
  }

  personToPersonTx(person: PersonData): PersonTx {
    return {
      _id: person._id,
      name: person.name,
      index: person.index,
      version: person.version,
      txs: Object.values(person.txs),
      type: person.type,
      month: person.month,
    };
  }

  // todo: use this prepare changes to send to backend
  personDiff({
    updatedData,
    oldData,
  }: {
    updatedData: Record<string, PersonData>;
    oldData: Record<string, PersonData>;
  }): PersonDiff {
    const added = Object.keys(updatedData)
      .filter((_id) => !oldData[_id])
      .map((_id) => updatedData[_id])
      .map((person) => this.personToPersonTx(person));
    const deleted = Object.keys(oldData).filter((_id) => !updatedData[_id]);
    const updated: PersonPatch[] = Object.keys(updatedData)
      .filter((_id) => oldData[_id])
      .map((_id) => {
        return this._personPatch(updatedData[_id], oldData[_id]);
      })
      .filter((personPatch) => personPatch !== undefined);

    return utils.removeEmptyArrayFields({ added, deleted, updated });
  }

  _personPatch(
    newPerson: PersonData,
    oldPerson: PersonData
  ): PersonPatch | undefined {
    const added: Tx[] = Object.keys(newPerson.txs)
      .filter((_id) => !oldPerson.txs[_id])
      .map((_id) => newPerson.txs[_id]);
    const updated: TxPatch[] = Object.keys(newPerson.txs)
      .filter((_id) => oldPerson.txs[_id])
      .map((_id) => this._txPatch(newPerson.txs[_id], oldPerson.txs[_id]))
      .filter((tx) => Object.values(tx ?? {}).length > 1)
      .filter((tx) => tx !== undefined);
    const deleted: string[] = Object.keys(oldPerson.txs).filter(
      (_id) => !newPerson.txs[_id]
    );

    let personPatch: PersonPatch = {
      _id: newPerson._id,
      version: newPerson.version,
      index: oldPerson.index != newPerson.index ? newPerson.index : undefined,
      name: oldPerson.name != newPerson.name ? newPerson.name : undefined,
      txDiff: utils.removeEmptyArrayFields({ added, updated, deleted }),
    };
    if (Object.keys(personPatch.txDiff ?? {}).length == 0) {
      delete personPatch.txDiff;
    }
    personPatch = utils.removeUndefinedFields(personPatch);

    // if any field present other than _id, version then we return patch
    if (Object.keys(personPatch).length > 2) {
      return personPatch;
    }
  }

  _txPatch(newTx: Tx, oldTx: Tx): TxPatch | undefined {
    let txPatch: TxPatch = {
      _id: oldTx._id,
      index: oldTx.index != newTx.index ? newTx.index : undefined,
      money: oldTx.money != newTx.money ? newTx.money : undefined,
      tag: oldTx.tag != newTx.tag ? newTx.tag : undefined,
    };
    txPatch = utils.removeUndefinedFields(txPatch);

    if (Object.keys(txPatch).length > 1) return txPatch;
  }

  /**
   * Deletes an entity based on provided IDs:
   * 1. If `personId` is specified without `txId`, deletes the person from `persons` and `personIds` (if present).
   * 2. If `txId` is specified, deletes the transaction.
   */
  deleteEntity = (
    personData: {
      persons: Record<string, PersonData> | null | undefined;
      personIds?: { id: string; type: TxType }[];
    },
    personId: string,
    txId?: string
  ) => {
    const { persons } = personData;
    if (!persons) return;
    if (!txId) {
      delete persons[personId];
      if (personData?.personIds)
        personData.personIds = personData.personIds.filter(
          (el) => el.id != personId
        );
    } else if (persons[personId]) {
      delete persons[personId].txs[txId];
      persons[personId].txIds = persons[personId].txIds.filter(
        (id) => id != txId
      );
    }
  };

  updatePersonVersion = (
    persons: Record<string, PersonData> | null | undefined,
    personId: string,
    newVersion: string
  ) => {
    if (persons && persons[personId]) {
      persons[personId].version = newVersion;
    }
  };
}

const personUtils = new PersonUtils();
export default personUtils;
