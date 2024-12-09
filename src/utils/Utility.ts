import { Person } from "../models/Person";

export default class Utility {
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

  personToString(person: Person): string {
    const { name, txIds, txs } = person;
    const total = Object.values(txs).reduce(
      (t, tx) => t + (utils.parseNumber(tx.money) ?? 0),
      0
    );

    let result = `Name: ${name}\nTotal: ${total}/-\n\nTransactions:`;

    txIds.forEach((id, index) => {
      const { money = "N/A", tag = "N/A" } = txs[id] || {};
      result += `\n${money} - ${tag}`;
    });

    return result;
  }
}

export const utils = new Utility();
