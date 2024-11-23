/** Represents a single transaction. */
export default interface Tx {
  _id: string;
  money?: string;
  tag?: string;
  index: number;
}
