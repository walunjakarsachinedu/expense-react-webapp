import { v4 } from "uuid";
import IPersonExpenseService from "../interface/IPersonExpenseService";
import MonthExpenseCache from "./MonthExpenseCache";
import PersonExpenseApi from "../../api/PersonExpenseApi";
import { PersonTx, TableType } from "../../types/Transaction";

export default class PersonExpenseService implements IPersonExpenseService {

  static readonly provider: IPersonExpenseService = new PersonExpenseService();


  get(id: String): PersonTx {
    return MonthExpenseCache.provider.getPersonTx(id)!;
  }

  async add(type: TableType): Promise<PersonTx> {
    const personTx: PersonTx = {
      _id: v4(),
      name: "",
      txs: [],
      type: type,
    }

    await PersonExpenseApi.provider.add(personTx);
    MonthExpenseCache.provider.addPerson(personTx);
    return personTx;
  }


  async updateName(id: String, name: String): Promise<PersonTx> {
    await PersonExpenseApi.provider.updateName(id, name);
    MonthExpenseCache.provider.updatePersonName(id, name);
    return this.get(id);
  }


  async delete(id: String): Promise<void> {
    await PersonExpenseApi.provider.delete(id);
    MonthExpenseCache.provider.deletePerson(id);
  }


  async reorder(id: String, index: number): Promise<void> {
    await PersonExpenseApi.provider.reorder(id, index);
    MonthExpenseCache.provider.reorderPerson(id, index);
  }
}