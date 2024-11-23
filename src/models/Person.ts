import { TableType } from "./TableType";
import Tx from "./Tx";

/** Represents a list of transactions for a person.
 * `type` indicates if it's for income or expense.  */
export interface Person {
  _id: string;
  name: string;
  type: TableType;
  txs: Tx[];
  index: number;
}
