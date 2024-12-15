import { PersonTx } from "../models/Person";

/** contains backend interaction for operation related to person & its transaction. */
export default class PersonExpenseApi {
  static readonly provider = new PersonExpenseApi();

  async add(personTx: PersonTx): Promise<PersonTx> {
    // TODO: logic to add person from backend
    return personTx;
  }

  async updateName(id: string, name: string): Promise<void> {
    // TODO: logic to update person name from backend
  }

  async delete(id: string): Promise<void> {
    // Todo: logic to delete person from backend
  }

  async reorder(id: string, index: number): Promise<void> {
    // Todo: logic to delete person from backend
  }
}
