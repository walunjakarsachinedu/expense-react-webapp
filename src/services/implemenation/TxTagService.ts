import { TxTagApi } from "../../api/TxTagApi";
import { Tx } from "../../types/Transaction";
import ITxTagService from "../interface/ITxTagService";
import MonthExpenseCache from "./MonthExpenseCache";
import { v4 as uuidv4 } from 'uuid';
import PersonExpenseService from "./PersonExpenseService";


export default class TxTagService implements ITxTagService {

  static readonly provider: ITxTagService = new TxTagService();


  get(id: string, personId: string): Tx {
    const txTag = MonthExpenseCache.provider.getTxTag(id, personId);
    return txTag;
  }


  async add(personId: string): Promise<Tx> {
    const tagId: string = uuidv4();
    const index = PersonExpenseService.provider.get(personId).txs.length;
    const tx: Tx = {_id: tagId, money: "", tag: "", index: index};
    await TxTagApi.provider.add(personId);
    const addedTx = MonthExpenseCache.provider.addTxTag(tx, personId);
    return addedTx;
  }


  async update(tx: Tx, personId: string): Promise<Tx> {
    await TxTagApi.provider.update(tx, personId);
    MonthExpenseCache.provider.updateTxTag(tx, personId);
    return tx;
  }


  async delete(id: string, personId: string): Promise<void> {
    await TxTagApi.provider.delete(id, personId);
    MonthExpenseCache.provider.deleteTxTag(id, personId);
  }


  async reorder(id: string, index: number, personId: string): Promise<void> {
    await TxTagApi.provider.reorder(id, index, personId);
    MonthExpenseCache.provider.reorderTxTag(id, index, personId);
  }
}