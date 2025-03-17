import { ErrorCodes } from "../api/ErrorContants";

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

  extractGraphqlError(error: unknown): ErrorCodes | undefined {
    return (error as { cause?: { extensions?: { code?: ErrorCodes } } })?.cause
      ?.extensions?.code;
  }
}

const utils = new Utility();

export default utils;
