/** Represents a single transaction's information. */
export interface Tx {
  _id: String;
  money?: String;
  tag?: String;
  date?: String;
}

/** Represents all person's transaction's information. */
export interface PersonTx {
  _id: String;
  name: String; 
  type: TableType;
  txs: Tx[];
}

/** define type of transaction */
export enum TableType {
  Expense="Expense",
  Income="Income"
};