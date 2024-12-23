class Utility {
  static readonly provider = new Utility();

  parseNumber(numStr?: string): number | undefined {
    try {
      if (numStr) {
        return parseInt(numStr);
      }
    } catch {
      // error
    }
  }

  formatToMonthYear(timestamp: number): string {
    const date = new Date(timestamp);
    const month = (date.getMonth() + 1).toString().padStart(2, "0"); // Ensure 2-digit month
    const year = date.getFullYear().toString(); // Get the full year
    return `${month}-${year}`;
  }

  dateToMMYY = (date: Date): string => {
    const month = this.monthIndexToName(date.getMonth());
    const year = date.getFullYear();
    return `${month} ${year}`;
  };

  monthIndexToName(value: number): string | undefined {
    const monthName = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    return monthName[value];
  }
}

const utils = new Utility();

export default utils;
