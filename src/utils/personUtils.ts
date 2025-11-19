import { produce } from "immer";
import {
  ChangedPersons,
  Changes,
  Filter,
  MonthData,
  MonthDiff,
  MonthlyNotes,
  PersonData,
  PersonPatch,
  PersonTx,
  Tx,
  TxPatch,
  TxType,
} from "../models/type";
import useExpenseStore from "../store/usePersonStore";
import { patchProcessing } from "./PatchProcessing";
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
    const txs = utils.toMapById(personUtils.normalizedPersonTxs(person.txs));

    return {
      ...person, 
      txs: txs,
      txIds: Object.values(txs)
        .sort((a, b) => a.index - b.index)
        .map((tx) => tx._id),
    };
  }

  personToPersonTx(person: PersonData): PersonTx {
    const txs = utils.toMapById(personUtils.normalizedPersonTxs(Object.values(person.txs)));
    
    return {
      _id: person._id,
      name: person.name,
      index: person.index,
      version: person.version,
      txs: Object.values(txs),
      type: person.type,
      month: person.month,
    };
  }

  normalizedPersonTxs(txs: Tx[], inline: boolean=false): Tx[] {
    const fn = (txs: Tx[]) => {
      txs.sort((a,b) => a.index - b.index).forEach((tx, idx) => tx.index = idx);
    };

    if(inline) {
      fn(txs);
      return txs;
    }

    return produce(txs, fn);
  }

  /** remove duplicate tx and correct all index. */
  normalizePerson(person: PersonData, inline: boolean=false): PersonData {
    person.txs = utils.toMapById(personUtils.normalizedPersonTxs(Object.values(person.txs), inline));
    person.txIds = Object.values(person.txs)
      .sort((a, b) => a.index - b.index)
      .map((tx) => tx._id);
    person.txs = utils.toMapById(person.txIds.map(_id => person.txs[_id]));
    return person;
  }

  monthDiff({
    updatedData,
    oldData,
    includeVersionChange = false,
  }: {
    updatedData: MonthData;
    oldData: MonthData;
    /** when true, also includes change containing just version change. */
    includeVersionChange?: boolean;
  }): MonthDiff {
    /// sanitize data
    updatedData = utils.sanitizeMonthData(updatedData);
    oldData = utils.sanitizeMonthData(oldData);

    const added = Object.keys(updatedData.persons)
      .filter((_id) => !oldData.persons[_id])
      .map((_id) => updatedData.persons[_id])
      .filter(Boolean)
      .map((person) => this.personToPersonTx(person));
    const deleted = Object.keys(oldData.persons).filter((_id) => !updatedData.persons[_id]);
    const updated: PersonPatch[] = Object.keys(updatedData.persons)
      .filter((_id) => oldData.persons[_id])
      .map((_id) => {
        return this.personPatch(
          updatedData.persons[_id],
          oldData.persons[_id],
          includeVersionChange
        );
      })
      .filter((personPatch) => personPatch !== undefined);

      const monthDiff: MonthDiff = utils.removeEmptyArrayFields({ added, deleted, updated } satisfies MonthDiff);
      if(updatedData.monthlyNotes && updatedData.monthlyNotes.notes != oldData.monthlyNotes?.notes) {
        monthDiff.monthlyNotes = {
          _id: updatedData.monthlyNotes._id,
          version: updatedData.monthlyNotes.version, 
          notes: updatedData.monthlyNotes.notes
        };
      }

      return monthDiff;
  }

  /** note: return undefined for just version change  */
  personPatch(
    newPerson: PersonData,
    oldPerson: PersonData,
    /** when true, also includes change containing just version change. */
    includeVersionChange: boolean = false
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

    if (includeVersionChange) return personPatch;

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
      performedAt: oldTx.performedAt != newTx.performedAt ? newTx.performedAt : undefined,
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

  /** Apply changes recieved from server. 
   * 
   * Algorithm:
   * - Apply add & delete changes.
   * - Apply update changes.
   * - Apply monthlyNotes.
   */
  applyChanges(
    store: MonthData,
    changes: MonthDiff,
  ): Record<string, PersonData> {
    const persons = store.persons;
    /// - Apply add & delete changes.
    changes.added?.map(personUtils.personTxToPerson)
      .forEach((person) => (persons[person._id] = person));
    changes.deleted?.forEach((id) => delete persons[id]);
 
    /// - Apply update changes.
    const diff: Record<string, PersonPatch | undefined> = utils.toMapById(
      changes.updated ?? []
    );
    Object.values(persons)
      .map((person) => ({ person, patch: diff[person._id] }))
      .map(personUtils._applyPatchToPerson)

    /// - Apply monthlyNotes.
    if(changes.monthlyNotes?.notes) {
      store.monthlyNotes = changes.monthlyNotes;
    }
    return persons;
  }

  /** 
   * Algorithm:
   * - Calculate updateDiff between changes.changedPersons and previous state
   * - Remove conflicting tx tags from updateDiff
   * - Build MonthDiff from changes & updateDiff
   */
  serverChangesToUpdateDiff(changes: Changes): MonthDiff {
    /// - Calculate updateDiff between changes.changedPersons and previous state
    const updateDiff = personUtils.monthDiff({
      // getting person from store which are updated from backend.
      oldData: {
        persons: utils.toMapById(
          Object.values(patchProcessing.prevState?.persons ?? {}).filter((person) =>
            changes.changedPersons.updatedPersons.find(
              (updatedPerson) => updatedPerson._id === person._id
            )
          )
        ),
        monthlyNotes: useExpenseStore.getState().monthlyNotes
      },
      updatedData: {
        persons: utils.toMapById(
          changes.changedPersons.updatedPersons.map(personUtils.personTxToPerson)
        ),
        monthlyNotes: changes.monthlyNotes
      },
      includeVersionChange: true,
    });

    /// - Remove conflicting tx tags from updateDiff
    const conflicts = useExpenseStore.getState().conflicts;
    if (conflicts) {
      updateDiff.updated?.forEach((updatedPerson) => {
        if (updatedPerson.txDiff?.deleted) {
          updatedPerson.txDiff.deleted = updatedPerson.txDiff.deleted.filter(
            (txId) => {
              return !conflicts?.find((person) => {
                return (
                  !person.isDeleted &&
                  person.txs?.find((tx) => tx._id == txId && tx.isDeleted)
                );
              });
            }
          );
        }
      });
    }

    /// - Build MonthDiff from changes & updateDiff 
    return { 
      added: changes.changedPersons.addedPersons, 
      deleted: changes.changedPersons.deletedPersons, 
      updated: updateDiff.updated, 
      monthlyNotes: changes.monthlyNotes
    } satisfies MonthDiff;
  }


  /** @returns object by skipping fields present in the `personPatch`. */
  private _applyPatchToPerson(args: {
    person: PersonData;
    patch: PersonPatch | undefined;
  }): PersonData {
    const { patch, person } = args;
    if (!patch) return person;

    if (patch.index) person.index = patch.index;
    if (patch.name) person.name = patch.name;
    if (patch.txDiff) {
      const newTxs = person.txs;
      patch.txDiff.added?.forEach((tx) => (newTxs[tx._id] = tx));
      patch.txDiff.deleted?.forEach((id) => delete newTxs[id]);
      patch.txDiff.updated?.forEach((diff) => {
        if (diff.index !== undefined) newTxs[diff._id].index = diff.index;
        if (diff.money !== undefined) newTxs[diff._id].money = diff.money;
        if (diff.tag !== undefined) newTxs[diff._id].tag = diff.tag;
        if (diff.performedAt || diff.performedAt === null) newTxs[diff._id].performedAt = diff.performedAt;
      });
      person.txIds = Object.values(person.txs)
        .sort((a, b) => a.index - b.index)
        .map((tx) => tx._id);
    }
    if (patch.version) person.version = patch.version;

    return person;
  }

  isTxSatisfyFilter(txId: string, filter: Filter) {
    return !filter.filteredTxIds || filter.filteredTxIds.has(txId) || filter.ignoreTxIds?.has(txId); 
  }
}

const personUtils = new PersonUtils();
export default personUtils;
