import { Tx } from "../models/type";

/** contains backend interaction for operation related to single transaction tag. */
export class TxTagApi {
  static readonly provider = new TxTagApi();

  async add(personId: string): Promise<void> {
    // todo: logic to add transaction tag from backend
  }

  async update(tx: Tx, personId: string): Promise<void> {
    // todo: logic to update transaction tag from backend
  }

  async delete(id: string, personId: string): Promise<void> {
    // todo: logic to update transaction tag from backend
  }

  async reorder(id: string, index: number, personId: string): Promise<void> {
    // todo: logic to order transaction tag from backend
  }
}
