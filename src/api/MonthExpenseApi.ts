import hash from "object-hash";
import { dummyPersonTx } from "../DummyData";
import { PersonTx } from "../types/Transaction";
import { utils } from "../utils/Utility";

/** contains backend interaction for operation related to month based transactions. */
export default class MonthExpenseApi {
  static readonly provider = new MonthExpenseApi();

  async getMonthExpense(): Promise<PersonTx[]> {
    // TODO: logic to populate month & year
    // dummy implementation 👇
    return dummyPersonTx;
  }

  async getMonthExpenseByIds(personIds: string[]): Promise<PersonTx[]> {
    return dummyPersonTx.filter((person) => personIds.includes(person._id));
  }

  async getMonthExpenseIdHash(): Promise<{ hash: string; _id: string }[]> {
    return dummyPersonTx.map((person) => ({
      hash: person.hash ?? hash(utils.personTxToPerson(person)),
      _id: person._id,
    }));
  }
}
