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
}

const utils = new Utility();

export default utils;
