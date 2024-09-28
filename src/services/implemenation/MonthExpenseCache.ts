import { produce } from "immer";
import { PersonTx, TableType, Tx } from "../../types/Transaction";
import Utility from "../../utils/Utility";
import IMonthExpenseCache from "../interface/IMonthExpenseCache";

export default class MonthExpenseCache implements IMonthExpenseCache {
  monthExpense?: PersonTx[];
  monthIncome?: PersonTx[];
  month?: string;
  year?: string;

  static readonly provider: IMonthExpenseCache = new MonthExpenseCache();


  cacheAllData({month, year, personList}: {month: string, year: string, personList: PersonTx[]}): void {
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


  getPersonTx(id: string): PersonTx {
    let personTx: PersonTx|undefined;
    personTx = this.monthExpense?.find(person => person._id === id);
    personTx ??= this.monthIncome?.find(person => person._id === id);
    return personTx!;
  }


  addPerson(personTx: PersonTx): void {
    const personList = this.getExpenseOfType(personTx.type);
    personList!.push(personTx);
  }


  updatePersonName(id: string, name: string): void {
    const person = this.getPersonTx(id);
    person.name = name;
  }


  reorderPerson(id: string, toIndex: number): void {
    const person = this.getPersonTx(id);
    const personList = this.getExpenseOfType(person.type);
    const fromIndex = this._getPersonIndex(id, person.type);
    Utility.provider.reorder(personList!, {fromIndex, toIndex});
  }


  deletePerson(id: string): void {
    const person = this.getPersonTx(id);
    const personList = this.getExpenseOfType(person.type);
    const index = this._getPersonIndex(id, person.type);
    personList!.splice(index, 1);
  }

  updatePersonTx(updatedPersonTx: PersonTx) {
    const expense = this.getExpenseOfType(updatedPersonTx.type);
    if(!expense) return;
    const index = expense.findIndex(person => updatedPersonTx._id === person._id);
    expense[index] = updatedPersonTx;
  }


  addTxTag(tx: Tx, personId: string): Tx {
    const personTx = this.getPersonTx(personId);
    const updatedPersonTx = produce(personTx, (personTx: PersonTx) => {personTx!.txs.unshift(tx)});
    this.updatePersonTx(updatedPersonTx);
    return tx;
  }


  getTxTag(id: string, personId: string): Tx {
    const personTx = this.getPersonTx(personId);
    return personTx!.txs.find(txs => txs._id === id)!;
  }

  
  updateTxTag(tx: Tx, personId: string): void {
    const index = this._getTxTagIndex(tx._id, personId);
    const person = this.getPersonTx(personId)!;
    const updatedPersonTx = produce(person, (personTx: PersonTx) => {personTx.txs[index] = tx});
    this.updatePersonTx(updatedPersonTx);
  }


  deleteTxTag(id: string, personId: string): void {
    const index = this._getTxTagIndex(id, personId);
    const personTx = this.getPersonTx(personId);
    const updatedPersonTx = produce(personTx, (personTx: PersonTx) => {personTx!.txs.splice(index, 1)});
    this.updatePersonTx(updatedPersonTx);
  }

  reorderTxTag(id: string, toIndex: number, personId: string): void {
    const fromIndex = this._getTxTagIndex(id, personId);
    const personTx = this.getPersonTx(personId);
    personTx!.txs = Utility.provider.reorder(personTx!.txs, {fromIndex, toIndex});
  }


  private _getPersonIndex(id: string, type: TableType): number {
    const personList = this.getExpenseOfType(type);
    return personList!.findIndex(person => person._id === id);
  }

  private _getTxTagIndex(id: string, personId: string): number {
    const personTx = this.getPersonTx(personId);
    return personTx!.txs.findIndex(tx => tx._id === id);;
  }
}