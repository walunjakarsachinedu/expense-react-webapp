import { MonthData, MonthDiff, MonthlyNotes } from "../models/type";

class Utility {
  static readonly provider = new Utility();

  parseNumber(numStr?: string | null): number | undefined {
    try {
      if (numStr) {
        return parseInt(numStr);
      }
    } catch {
      // error
    }
  }

  /** format date in format: MM-yyyy e.g., 02-2025 */
  formatToMonthYear(timestamp: number | Date): string {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensure 2-digit month
    const year = date.getFullYear().toString(); // Get the full year
    return `${month}-${year}`;
  }

  /** get short month name (e.g., "Oct") from "MM-yyyy" */
  getShortMonthName(monthYear: string): string {
    const [month, year] = monthYear.split("-").map(Number);
    const date = new Date(year, month - 1);
    return date.toLocaleString("en", { month: "short" }); // e.g., "Oct"
  }

  /** get last day number of month (e.g., 31) from "MM-yyyy" */
  getLastDayOfMonth(monthYear: string): number {
    const [month, year] = monthYear.split("-").map(Number);
    return new Date(year, month, 0).getDate();
  }

  /** parse date string of format: MM-yyyy */
  parseDate(monthYear: string): Date {
    const [month, year] = monthYear.split("-").map(Number);
    return new Date(year, month - 1, 1); // Month is 0-based in JS Date
  }

  /** removes all field with `value == undefined` */
  removeUndefinedFields<T extends Partial<Record<string, unknown>>>(obj: T): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== undefined)
    ) as T;
  }

  /** removes all field with `value.length == 0` */
  removeEmptyArrayFields<T extends Partial<Record<string, unknown[]>>>(
    obj: T
  ): T {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value?.length ?? 0 > 0)
    ) as T;
  }

  formatNumber(num: number): string {
    const str = num.toString();
    const lastThree = str.slice(-3);
    const otherDigits = str.slice(0, -3);
    const formatted = otherDigits.replace(/\B(?=(\d{2})+(?!\d))/g, ",");
    return otherDigits ? `${formatted},${lastThree}` : lastThree;
  }

  isPatchEmpty(diff: MonthDiff): boolean {
    return !(diff.added?.length || diff.updated?.length || diff.deleted?.length || diff.monthlyNotes); 
  }

  toMapById<T extends { _id: string }>(arr: T[]): Record<string, T> {
    return arr.reduce((acc, cur) => {
      acc[cur._id] = cur;
      return acc;
    }, {} as Record<string, T>);
  }

  sanitizeMonthData(monthData: MonthData): MonthData {
    return {persons: monthData.persons, monthlyNotes: monthData.monthlyNotes};
  }
}

const utils = new Utility();

export default utils;
