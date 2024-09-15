import { dummyPersonTx } from "../DummyData";
import { PersonTx } from "../types/Transaction";

/** contains backend interaction for operation related to month based transactions. */
export default class MonthExpenseApi {

  static readonly provider = new MonthExpenseApi();

  async getMonthExpense(): Promise<PersonTx[]> {
    // TODO: logic to populate month & year
    // dummy implementation 👇
    return dummyPersonTx;
  }
}