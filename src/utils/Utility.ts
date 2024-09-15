import { PersonTx, Tx } from "../types/Transaction";

export default class Utility {
  static readonly provider = new Utility();

  reorder<T>(arr: T[], {fromIndex, toIndex}: {fromIndex: number, toIndex: number}): T[] {

    const element = arr.splice(fromIndex, 1)[0]; // Remove element from `fromIndex`
    arr.splice(toIndex, 0, element); // Insert element at `toIndex`
    return arr;
  }

  parseNumber(numStr?: String): number|undefined {
    try {
      if(numStr) {
        return parseInt(numStr.toString());
      }
    }
    catch { }
  }

  txsTotal(txs: Tx[]):number {
    return txs.reduce<number>((prev: number, cur) => prev += Utility.provider.parseNumber(cur.money) ?? 0, 0);
  }

  personTotal(personList: PersonTx[]): number {
    const total = personList?.reduce<number>((prev: number, cur) => Utility.provider.txsTotal(cur.txs), 0);
    return total ?? 0;
  }
}