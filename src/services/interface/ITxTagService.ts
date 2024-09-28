import { Tx } from "../../types/Transaction";

/** contains all operations related to transaction tag. */
export default interface ITxTagService {
  /** get person details & transaction. */
  get(id: string, personId: string): Tx;
  /** add & get added expense tag. */
  add(personId: string): Promise<Tx>;
  /** get expense tag. */
  update(tx: Tx, personId: string): Promise<Tx>;
  /** delete expense tag. */
  delete(id: string, personId: string): Promise<void>;
  /** reorder expense tag in person expense list. */
  reorder(tx: string, index: number, personId: string): Promise<void>;
}