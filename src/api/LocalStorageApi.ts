import { LocalStorageValues } from "../types/LocalStorageValues";

export default class LocalStorageApi {
  static readonly provider = new LocalStorageApi();

  getSelectedMonthYear(): { month: string; year: string } {
    const now: Date = new Date();
    const month = localStorage.getItem(LocalStorageValues.month);
    const year = localStorage.getItem(LocalStorageValues.year);
    return {
      month: month ?? `${now.getMonth() + 1}`,
      year: year ?? `${now.getFullYear()}`,
    };
  }

  storeSelectedMonthYear({ month, year }: { month: string; year: string }) {
    localStorage.setItem(LocalStorageValues.month, month);
    localStorage.setItem(LocalStorageValues.year, year);
  }
}
