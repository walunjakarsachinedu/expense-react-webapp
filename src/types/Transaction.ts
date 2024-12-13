/** Structure of transaction tag for backend interaction. */
export interface Tx {
  _id: string;
  money?: string;
  tag?: string;
  date?: string;
  index: number;
}

/** Structure of person for backend interaction. */
export interface PersonTx {
  _id: string;
  name: string;
  type: TableType;
  txs: Tx[];
  hash?: string;
  index: number;
  month: string;
}

/** define type of transaction */
export enum TableType {
  Expense = "Expense",
  Income = "Income",
}
