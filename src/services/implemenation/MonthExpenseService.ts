import MonthExpenseApi from "../../api/MonthExpenseApi";
import { PersonTx, TableType } from "../../types/Transaction";
import IMonthExpenseService from "../interface/IMonthExpenseService";
import MonthExpenseCache from "./MonthExpenseCache";



export class MonthExpenseService implements IMonthExpenseService {

  static readonly provider: IMonthExpenseService = new MonthExpenseService(); 


  /** get and cache month expense */
  async getAndCacheMonthAllTxs(month: string, year: string): Promise<PersonTx[]> {
    var personList: PersonTx[] = [];
    personList = await MonthExpenseApi.provider.getMonthExpense();
    MonthExpenseCache.provider.cacheAllData({month, year, personList});
    return personList;
  }

  getMonthExpense(): PersonTx[] | undefined {
    return MonthExpenseCache.provider.getMonthExpense();
  }


  getMonthIncome(): PersonTx[] | undefined {
    return MonthExpenseCache.provider.getMonthIncome();
  }

  getExpenseOfType(type: TableType): PersonTx[] | undefined {
    return MonthExpenseCache.provider.getExpenseOfType(type);
  }
}