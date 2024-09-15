import { PersonTx, TableType } from "../../types/Transaction";

/** contains all operations related to single person. */
export default interface IPersonExpenseService {
  /** get expense for person. */
  get(id: String) : PersonTx;
  /** add person in give `type` table. */
  add(type: TableType): Promise<PersonTx>;
  /** delete person expense. */
  updateName(id: String, name: String) : Promise<PersonTx>;
  /** add person in given `type` of table. */
  delete(id: String) : Promise<void>;
  /** reorder person in expense table. */
  reorder(id: String, index: number) : Promise<void>;
}