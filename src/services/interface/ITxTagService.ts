import { Tx } from "../../types/Transaction";

/** contains all operations related to transaction tag. */
export default interface ITxTagService {
  /** get person details & transaction. */
  get(id: String, personId: String): Tx;
  /** add & get added expense tag. */
  add(personId: String): Promise<Tx>;
  /** get expense tag. */
  update(tx: Tx, personId: String): Promise<Tx>;
  /** delete expense tag. */
  delete(id: String, personId: String): Promise<void>;
  /** reorder expense tag in person expense list. */
  reorder(tx: String, index: number, personId: String): Promise<void>;
}