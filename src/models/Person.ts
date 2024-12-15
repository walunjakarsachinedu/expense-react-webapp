import { TableType } from "./TableType";
import Tx from "./Tx";

/** Sturcture of person for client use.  */
export interface Person {
  _id: string;
  name: string;
  type: TableType;
  txs: Record<string, Tx>;
  txIds: string[];
  hash: string;
  index: number;
  month: string;
}

/** Structure of person for backend interaction. */
export interface PersonTx {
  _id: string;
  name: string;
  type: TableType;
  txs: Tx[];
  hash: string;
  index: number;
  month: string;
}
