import { PersonTx, TableType, Tx } from "../../types/Transaction";

export default interface IMonthExpenseCache {
  cacheAllData({month, year, personList}: {month: string, year: string, personList: PersonTx[]}): void;
  /** get list of person ids in expense table for current month. */
  getMonthExpense(): PersonTx[] | undefined;
  /** get list of person ids in income table for current month. */
  getMonthIncome(): PersonTx[] | undefined;
  /** get list of person of specified `type`. */
  getExpenseOfType(type: TableType): PersonTx[] | undefined 


  /** get person from cache. */
  getPersonTx(id: string): PersonTx 
  /** add person in cache. */
  addPerson(personTx: PersonTx): void 
  /** update person name in cache. */
  updatePersonName(id: string, name: string): void 
  /** reorder person in cache. */
  reorderPerson(id: string, toIndex: number): void 
  /** add person in cache. */
  deletePerson(id: string): void 


  /** add transaction tag in cache. */
  addTxTag(tx: Tx, personId: string): Tx 
  /** get transaction tag from cache. */
  getTxTag(id: string, personId: string): Tx 
  /** update transaction tag in cache. */
  updateTxTag(tx: Tx, personId: string): void 
  /** delete transaction tag in cache. */
  deleteTxTag(id: string, personId: string): void 
  /** reorder transaction tag in cache. */
  reorderTxTag(id: string, toIndex: number, personId: string): void 
}