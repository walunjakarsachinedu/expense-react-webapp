const transactionData: AllPersonTxs =
{
  title: "Expense History",
  persons: [
    {
      name: "Alice",
      txs: [
        { money: 50, tag: "groceries" },
        { money: 200, tag: "rent" },
        { money: 15, tag: "coffee" },
        { money: 120, tag: "shopping" },
        { money: 40, tag: "transport" },
        { money: 10, tag: "snacks" },
        { money: 30, tag: "utilities" },
        { money: 75, tag: "entertainment" },
        { money: 25, tag: "subscription" },
        { money: 150, tag: "medical" },
        { money: 60, tag: "fitness" }
      ]
    },
    {
      name: "Bob",
      txs: [
        { money: 300, tag: "rent" },
        { money: 25, tag: "groceries" },
        { money: 20, tag: "dining" },
        { money: 50, tag: "transport" },
        { money: 100, tag: "utilities" },
        { money: 60, tag: "shopping" },
        { money: 80, tag: "entertainment" },
        { money: 40, tag: "subscription" },
        { money: 200, tag: "medical" },
        { money: 30, tag: "fitness" },
        { money: 15, tag: "snacks" }
      ]
    },
    {
      name: "Charlie",
      txs: [
        { money: 250, tag: "rent" },
        { money: 35, tag: "groceries" },
        { money: 45, tag: "transport" },
        { money: 75, tag: "shopping" },
        { money: 50, tag: "dining" },
        { money: 25, tag: "subscription" },
        { money: 100, tag: "medical" },
        { money: 20, tag: "coffee" },
        { money: 60, tag: "entertainment" },
        { money: 30, tag: "fitness" },
        { money: 40, tag: "utilities" }
      ]
    },
    {
      name: "Diana",
      txs: [
        { money: 60, tag: "groceries" },
        { money: 150, tag: "rent" },
        { money: 10, tag: "coffee" },
        { money: 90, tag: "shopping" },
        { money: 30, tag: "transport" },
        { money: 20, tag: "snacks" },
        { money: 100, tag: "utilities" },
        { money: 25, tag: "subscription" },
        { money: 70, tag: "entertainment" },
        { money: 40, tag: "fitness" },
        { money: 50, tag: "medical" }
      ]
    },
    {
      name: "Eva",
      txs: [
        { money: 120, tag: "rent" },
        { money: 35, tag: "groceries" },
        { money: 20, tag: "dining" },
        { money: 60, tag: "transport" },
        { money: 50, tag: "shopping" },
        { money: 15, tag: "snacks" },
        { money: 30, tag: "utilities" },
        { money: 80, tag: "entertainment" },
        { money: 40, tag: "subscription" },
        { money: 25, tag: "medical" },
        { money: 70, tag: "fitness" }
      ]
    },
    {
      name: "Frank",
      txs: [
        { money: 200, tag: "rent" },
        { money: 50, tag: "groceries" },
        { money: 25, tag: "coffee" },
        { money: 80, tag: "shopping" },
        { money: 45, tag: "transport" },
        { money: 10, tag: "snacks" },
        { money: 60, tag: "utilities" },
        { money: 100, tag: "entertainment" },
        { money: 30, tag: "subscription" },
        { money: 70, tag: "medical" },
        { money: 40, tag: "fitness" }
      ]
    },
    {
      name: "Grace",
      txs: [
        { money: 300, tag: "rent" },
        { money: 40, tag: "groceries" },
        { money: 30, tag: "coffee" },
        { money: 100, tag: "shopping" },
        { money: 20, tag: "transport" },
        { money: 15, tag: "snacks" },
        { money: 50, tag: "utilities" },
        { money: 75, tag: "entertainment" },
        { money: 20, tag: "subscription" },
        { money: 60, tag: "medical" },
        { money: 35, tag: "fitness" }
      ]
    },
    {
      name: "Henry",
      txs: [
        { money: 150, tag: "rent" },
        { money: 30, tag: "groceries" },
        { money: 40, tag: "coffee" },
        { money: 70, tag: "shopping" },
        { money: 20, tag: "transport" },
        { money: 25, tag: "snacks" },
        { money: 90, tag: "utilities" },
        { money: 50, tag: "entertainment" },
        { money: 30, tag: "subscription" },
        { money: 75, tag: "medical" },
        { money: 40, tag: "fitness" }
      ]
    },
  ]
};

const incomeData: AllPersonTxs = {
  title: "Income",
  persons: [
    {
      name: "Alice",
      txs: [
        { money: 500, tag: "salary" },
        { money: 100, tag: "freelance" },
        { money: 50, tag: "bonus" }
      ]
    },
    {
      name: "Bob",
      txs: [
        { money: 600, tag: "salary" },
        { money: 150, tag: "bonus" },
        { money: 75, tag: "side job" }
      ]
    },
    {
      name: "Charlie",
      txs: [
        { money: 700, tag: "salary" },
        { money: 200, tag: "freelance" },
        { money: 100, tag: "investment" }
      ]
    },
    {
      name: "Diana",
      txs: [
        { money: 800, tag: "salary" },
        { money: 300, tag: "freelance" },
        { money: 50, tag: "gift" }
      ]
    },
    {
      name: "Eva",
      txs: [
        { money: 650, tag: "salary" },
        { money: 100, tag: "bonus" },
        { money: 25, tag: "side job" }
      ]
    },
    {
      name: "Frank",
      txs: [
        { money: 700, tag: "salary" },
        { money: 150, tag: "freelance" },
        { money: 80, tag: "investment" }
      ]
    },
    {
      name: "Grace",
      txs: [
        { money: 750, tag: "salary" },
        { money: 200, tag: "freelance" },
        { money: 100, tag: "bonus" }
      ]
    },
    {
      name: "Henry",
      txs: [
        { money: 700, tag: "salary" },
        { money: 150, tag: "freelance" },
        { money: 50, tag: "side job" }
      ]
    }
  ]
};

const upcomingExpenseData: AllPersonTxs = {
  title: "Upcoming Expense",
  persons: [
    {
      name: "Alice",
      txs: [
        { money: 100, tag: "rent", date: "2024-08-20" },
        { money: 60, tag: "utilities", date: "2024-08-25" },
        { money: 30, tag: "transport", date: "2024-08-18" },
        { money: 50, tag: "medical", date: "2024-08-22" },
        { money: 40, tag: "groceries", date: "2024-08-27" },
        { money: 20, tag: "dining", date: "2024-08-24" }
      ]
    },
    {
      name: "Bob",
      txs: [
        { money: 300, tag: "rent", date: "2024-08-21" },
        { money: 50, tag: "transport", date: "2024-08-22" },
        { money: 40, tag: "subscription", date: "2024-08-27" },
        { money: 70, tag: "entertainment", date: "2024-08-26" },
        { money: 25, tag: "groceries", date: "2024-08-19" },
        { money: 15, tag: "snacks", date: "2024-08-23" }
      ]
    },
    {
      name: "Charlie",
      txs: [
        { money: 200, tag: "rent", date: "2024-08-22" },
        { money: 40, tag: "dining", date: "2024-08-24" },
        { money: 100, tag: "medical", date: "2024-08-28" },
        { money: 60, tag: "entertainment", date: "2024-08-29" },
        { money: 50, tag: "groceries", date: "2024-08-21" },
        { money: 25, tag: "transport", date: "2024-08-18" }
      ]
    },
    {
      name: "Diana",
      txs: [
        { money: 150, tag: "rent", date: "2024-08-25" },
        { money: 75, tag: "shopping", date: "2024-08-26" },
        { money: 20, tag: "snacks", date: "2024-08-19" },
        { money: 30, tag: "medical", date: "2024-08-22" },
        { money: 60, tag: "utilities", date: "2024-08-23" },
        { money: 40, tag: "entertainment", date: "2024-08-28" }
      ]
    },
    {
      name: "Eva",
      txs: [
        { money: 120, tag: "rent", date: "2024-08-20" },
        { money: 30, tag: "utilities", date: "2024-08-23" },
        { money: 40, tag: "entertainment", date: "2024-08-29" },
        { money: 50, tag: "shopping", date: "2024-08-21" },
        { money: 20, tag: "dining", date: "2024-08-19" },
        { money: 25, tag: "snacks", date: "2024-08-24" }
      ]
    },
    {
      name: "Frank",
      txs: [
        { money: 250, tag: "rent", date: "2024-08-22" },
        { money: 100, tag: "entertainment", date: "2024-08-24" },
        { money: 50, tag: "groceries", date: "2024-08-19" },
        { money: 45, tag: "transport", date: "2024-08-20" },
        { money: 30, tag: "medical", date: "2024-08-27" },
        { money: 10, tag: "snacks", date: "2024-08-23" }
      ]
    },
    {
      name: "Grace",
      txs: [
        { money: 200, tag: "rent", date: "2024-08-21" },
        { money: 40, tag: "groceries", date: "2024-08-23" },
        { money: 60, tag: "medical", date: "2024-08-29" },
        { money: 50, tag: "utilities", date: "2024-08-26" },
        { money: 75, tag: "entertainment", date: "2024-08-22" },
        { money: 30, tag: "dining", date: "2024-08-18" }
      ]
    },
    {
      name: "Henry",
      txs: [
        { money: 150, tag: "rent", date: "2024-08-25" },
        { money: 50, tag: "transport", date: "2024-08-22" },
        { money: 30, tag: "subscription", date: "2024-08-27" },
        { money: 40, tag: "entertainment", date: "2024-08-26" },
        { money: 20, tag: "groceries", date: "2024-08-19" },
        { money: 25, tag: "snacks", date: "2024-08-24" }
      ]
    }
  ]
};


export {incomeData, upcomingExpenseData};
export default transactionData;