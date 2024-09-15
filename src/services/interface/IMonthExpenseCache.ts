import { PersonTx, TableType, Tx } from "../../types/Transaction";

export default interface IMonthExpenseCache {
  cacheAllData({month, year, personList}: {month: String, year: String, personList: PersonTx[]}): void;
  /** get list of person ids in expense table for current month. */
  getMonthExpense(): PersonTx[] | undefined;
  /** get list of person ids in income table for current month. */
  getMonthIncome(): PersonTx[] | undefined;
  /** get list of person ids of specified `type`. */
  getExpenseOfType(type: TableType): PersonTx[] | undefined 


  /** get person from cache. */
  getPersonTx(id: String): PersonTx 
  /** add person in cache. */
  addPerson(personTx: PersonTx): void 
  /** update person name in cache. */
  updatePersonName(id: String, name: String): void 
  /** reorder person in cache. */
  reorderPerson(id: String, toIndex: number): void 
  /** add person in cache. */
  deletePerson(id: String): void 


  /** add transaction tag in cache. */
  addTxTag(tx: Tx, personId: String): Tx 
  /** get transaction tag from cache. */
  getTxTag(id: String, personId: String): Tx 
  /** update transaction tag in cache. */
  updateTxTag(tx: Tx, personId: String): void 
  /** delete transaction tag in cache. */
  deleteTxTag(id: String, personId: String): void 
  /** reorder transaction tag in cache. */
  reorderTxTag(id: String, toIndex: number, personId: String): void 
}