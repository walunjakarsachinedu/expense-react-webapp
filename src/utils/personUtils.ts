import { Person, PersonTx } from "../models/Person";
import Tx from "../models/Tx";
import utils from "./utils";

class PersonUtils {
  personToString(person: Person): string {
    const { name, txIds, txs } = person;
    const total = Object.values(txs).reduce(
      (t, tx) => t + (utils.parseNumber(tx.money) ?? 0),
      0
    );

    let result = `Name: ${name}\nTotal: ${total}/-\n\nTransactions:`;

    txIds.forEach((id, index) => {
      const { money = "N/A", tag = "N/A" } = txs[id] || {};
      result += `\n${money} - ${tag}`;
    });

    return result;
  }

  personTxToPerson(person: PersonTx): Person {
    return {
      ...person,
      txs: person.txs.reduce<Record<string, Tx>>(
        (txMap, tx) => ({ ...txMap, [tx._id]: tx }),
        {}
      ),
      txIds: person.txs.sort((a, b) => a.index - b.index).map((tx) => tx._id),
    };
  }

  personToPersonTx(person: Person): PersonTx {
    return {
      _id: person._id,
      name: person.name,
      index: person.index,
      hash: person.hash,
      txs: Object.values(person.txs),
      type: person.type,
      month: person.month,
    };
  }
}

const personUtils = new PersonUtils();
export default personUtils;
