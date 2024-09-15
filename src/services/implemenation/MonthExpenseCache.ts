import { PersonTx, TableType, Tx } from "../../types/Transaction";
import Utility from "../../utils/Utility";
import IMonthExpenseCache from "../interface/IMonthExpenseCache";

export default class MonthExpenseCache implements IMonthExpenseCache {
  monthExpense?: PersonTx[];
  monthIncome?: PersonTx[];
  month?: String;
  year?: String;

  static readonly provider: IMonthExpenseCache = new MonthExpenseCache();


  cacheAllData({month, year, personList}: {month: String, year: String, personList: PersonTx[]}): void {
    this.month = month;
    this.year = year;
    this.monthExpense = personList.filter(person => person.type === TableType.Expense);
    this.monthIncome = personList.filter(person => person.type === TableType.Income);
  }


  getMonthExpense(): PersonTx[] | undefined {
    return this.monthExpense;
  }


  getMonthIncome(): PersonTx[] | undefined {
    return this.monthIncome;
  }


  getExpenseOfType(type: TableType): PersonTx[] | undefined {
    const expense = type === TableType.Expense ? this.getMonthExpense() : this.getMonthIncome();
    return expense;
  }


  getPersonTx(id: String): PersonTx {
    let personTx: PersonTx|undefined;
    personTx = this.monthExpense?.find(person => person._id === id);
    personTx ??= this.monthIncome?.find(person => person._id === id);
    return personTx!;
  }


  addPerson(personTx: PersonTx): void {
    const personList = this.getExpenseOfType(personTx.type);
    personList!.push(personTx);
  }


  updatePersonName(id: String, name: String): void {
    const person = this.getPersonTx(id);
    person.name = name;
  }


  reorderPerson(id: String, toIndex: number): void {
    const person = this.getPersonTx(id);
    const personList = this.getExpenseOfType(person.type);
    const fromIndex = this._getPersonIndex(id, person.type);
    Utility.provider.reorder(personList!, {fromIndex, toIndex});
  }


  deletePerson(id: String): void {
    const person = this.getPersonTx(id);
    const personList = this.getExpenseOfType(person.type);
    const index = this._getPersonIndex(id, person.type);
    personList!.splice(index, 1);
  }


  addTxTag(tx: Tx, personId: String): Tx {
    const personTx = this.getPersonTx(personId);
    personTx!.txs.unshift(tx);
    return tx;
  }


  getTxTag(id: String, personId: String): Tx {
    const personTx = this.getPersonTx(personId);
    return personTx!.txs.find(txs => txs._id === id)!;
  }

  
  updateTxTag(tx: Tx, personId: String): void {
    const index = this._getTxTagIndex(tx._id, personId);
    const tagList = this.getPersonTx(personId)!.txs;
    tagList[index] = tx;
  }


  deleteTxTag(id: String, personId: String): void {
    const index = this._getTxTagIndex(id, personId);
    const personTx = this.getPersonTx(personId);
    personTx!.txs.splice(index, 1);
  }

  reorderTxTag(id: String, toIndex: number, personId: String): void {
    const fromIndex = this._getTxTagIndex(id, personId);
    const personTx = this.getPersonTx(personId);
    personTx!.txs = Utility.provider.reorder(personTx!.txs, {fromIndex, toIndex});
  }


  private _getPersonIndex(id: String, type: TableType): number {
    const personList = this.getExpenseOfType(type);
    return personList!.findIndex(person => person._id === id);
  }

  private _getTxTagIndex(id: String, personId: String): number {
    const personTx = this.getPersonTx(personId);
    return personTx!.txs.findIndex(tx => tx._id === id);;
  }
}