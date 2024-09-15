import { Tx } from "../types/Transaction";

/** contains backend interaction for operation related to single transaction tag. */
export class TxTagApi {

  static readonly provider = new TxTagApi();

  async add(personId: String): Promise<void> {
    // todo: logic to add transaction tag from backend
  }


  async update(tx: Tx, personId: String): Promise<void> {
    // todo: logic to update transaction tag from backend
  }


  async delete(id: String, personId: String): Promise<void> {
    // todo: logic to update transaction tag from backend
  }


  async reorder(id: String, index: number, personId: String): Promise<void> {
    // todo: logic to order transaction tag from backend
  }
}