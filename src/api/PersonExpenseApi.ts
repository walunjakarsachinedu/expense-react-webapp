import { PersonTx } from "../types/Transaction";

/** contains backend interaction for operation related to person & its transaction. */
export default class PersonExpenseApi {
  static readonly provider = new PersonExpenseApi();


  async add(personTx: PersonTx): Promise<PersonTx> {
    // TODO: logic to add person from backend
    return personTx;
  }

  async updateName(id: String, name: String): Promise<void> {
    // TODO: logic to update person name from backend
  }

  async delete(id: String): Promise<void> {
    // Todo: logic to delete person from backend
  }

  async reorder(id: String, index: number): Promise<void> {
    // Todo: logic to delete person from backend
  }
}