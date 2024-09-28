import { PersonTx, TableType } from "../../types/Transaction";

/** contains all operations related to single person. */
export default interface IPersonExpenseService {
  /** get expense for person. */
  get(id: string) : PersonTx;
  /** add person in give `type` table. */
  add(type: TableType): Promise<PersonTx>;
  /** delete person expense. */
  updateName(id: string, name: string) : Promise<PersonTx>;
  /** add person in given `type` of table. */
  delete(id: string) : Promise<void>;
  /** reorder person in expense table. */
  reorder(id: string, index: number) : Promise<void>;
}