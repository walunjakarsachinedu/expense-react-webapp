import { v4 } from "uuid";
import IPersonExpenseService from "../interface/IPersonExpenseService";
import MonthExpenseCache from "./MonthExpenseCache";
import PersonExpenseApi from "../../api/PersonExpenseApi";
import { PersonTx, TableType } from "../../types/Transaction";
import { MonthExpenseService } from "./MonthExpenseService";

export default class PersonExpenseService implements IPersonExpenseService {

  static readonly provider: IPersonExpenseService = new PersonExpenseService();


  get(id: string): PersonTx {
    return MonthExpenseCache.provider.getPersonTx(id)!;
  }

  async add(type: TableType): Promise<PersonTx> {
    const index = MonthExpenseService.provider.getExpenseOfType(type)?.length ?? 0;
    const personTx: PersonTx = {
      _id: v4(),
      name: "",
      txs: [],
      type: type,
      index: index
    }

    PersonExpenseApi.provider.add(personTx);
    MonthExpenseCache.provider.addPerson(personTx);
    return personTx;
  }


  async updateName(id: string, name: string): Promise<PersonTx> {
    await PersonExpenseApi.provider.updateName(id, name);
    MonthExpenseCache.provider.updatePersonName(id, name);
    return this.get(id);
  }


  async delete(id: string): Promise<void> {
    await PersonExpenseApi.provider.delete(id);
    MonthExpenseCache.provider.deletePerson(id);
  }


  async reorder(id: string, index: number): Promise<void> {
    await PersonExpenseApi.provider.reorder(id, index);
    MonthExpenseCache.provider.reorderPerson(id, index);
  }
}