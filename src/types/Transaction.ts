/** Represents a single transaction's information. */
export interface Tx {
  _id: string;
  money?: string;
  tag?: string;
  date?: string;
  index: number;
}

/** Represents all person's transaction's information. */
export interface PersonTx {
  _id: string;
  name: string; 
  type: TableType;
  txs: Tx[];
  index: number;
}

/** define type of transaction */
export enum TableType {
  Expense="Expense",
  Income="Income"
};