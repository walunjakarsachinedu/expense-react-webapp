import { PersonTx } from "../../types/Transaction";

/** contains all operations related to month transactions. */
export default interface IMonthExpenseService {
  /** get all person transaction of selected month. */
  getAndCacheMonthAllTxs(month: String, year: String): Promise<PersonTx[]>;
  /** get all person expense of selected month. */
  getMonthExpense(): PersonTx[] | undefined;
  /** get all person income of selected month. */
  getMonthIncome(): PersonTx[] | undefined; 


}
