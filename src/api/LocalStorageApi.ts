import { LocalStorageValues } from "../types/LocalStorageValues";
import { Themes } from "../types/Theme";

export default class LocalStorageApi {
  static readonly provider = new LocalStorageApi();

  getSelectedMonthYear() : {month: string, year: string} {
    const now: Date = new Date();
    const month = localStorage.getItem(LocalStorageValues.month);
    const year = localStorage.getItem(LocalStorageValues.year);
    return {
      month: month ?? `${now.getMonth() + 1}`, 
      year: year ?? `${now.getFullYear()}`
    };
  }

  storeSelectedMonthYear({month, year} : {month: string, year: string}) {
    localStorage.setItem(LocalStorageValues.month, month.tostring());
    localStorage.setItem(LocalStorageValues.year, year.tostring());
  }


  getSelectedTheme() : Themes {
    const theme = localStorage.getItem(LocalStorageValues.theme);
    return theme === Themes.dark ? Themes.dark : Themes.indigo;
  }

  storeSelectedTheme(theme: Themes) {
    localStorage.setItem(LocalStorageValues.theme, theme);
  }
  
}