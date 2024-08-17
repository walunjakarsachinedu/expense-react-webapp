/** Represents a single transaction's information. */
interface Tx {
  money?: number;
  tag?: string;
  date?: string;
}

/** Represents all person's transaction's information. */
interface PersonTx {
  name: string; 
  txs: Tx[];
}


/** Represents a collection of transactions for multiple persons */
interface AllPersonTxs {
  title: String;
  persons: PersonTx[];
}
