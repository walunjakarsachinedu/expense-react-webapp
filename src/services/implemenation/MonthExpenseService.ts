import MonthExpenseApi from "../../api/MonthExpenseApi";
import { PersonTx } from "../../types/Transaction";
import IMonthExpenseService from "../interface/IMonthExpenseService";
import MonthExpenseCache from "./MonthExpenseCache";



export class MonthExpenseService implements IMonthExpenseService {

  static readonly provider: IMonthExpenseService = new MonthExpenseService(); 


  /** get and cache month expense */
  async getAndCacheMonthAllTxs(month: String, year: String): Promise<PersonTx[]> {
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
}