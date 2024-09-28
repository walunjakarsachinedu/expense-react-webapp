import { PersonTx, TableType } from "./types/Transaction";

export const dummyPersonTx: PersonTx[] =[{
  "_id": "1",
  "name": "John Doe",
  "type": TableType.Expense,
  "txs": [
    {
      "_id": "tx1",
      "money": "120",
      "tag": "Groceries",
      "date": "2024-09-01",
      "index": 0
    },
    {
      "_id": "tx2",
      "money": "80",
      "tag": "Fuel",
      "date": "2024-09-02",
      "index": 1
    },
    {
      "_id": "tx3",
      "money": "50",
      "tag": "Coffee",
      "date": "2024-09-03",
      "index": 2
    },
    {
      "_id": "tx4",
      "money": "200",
      "tag": "Rent",
      "date": "2024-09-04",
      "index": 3
    },
    {
      "_id": "tx5",
      "money": "70",
      "tag": "Utilities",
      "date": "2024-09-05",
      "index": 4
    },
    {
      "_id": "tx6",
      "money": "150",
      "tag": "Clothing",
      "date": "2024-09-06",
      "index": 5
    },
    {
      "_id": "tx7",
      "money": "60",
      "tag": "Dining Out",
      "date": "2024-09-07",
      "index": 6
    },
    {
      "_id": "tx8",
      "money": "90",
      "tag": "Books",
      "date": "2024-09-08",
      "index": 7
    },
    {
      "_id": "tx9",
      "money": "100",
      "tag": "Gym Membership",
      "date": "2024-09-09",
      "index": 8
    },
    {
      "_id": "tx10",
      "money": "40",
      "tag": "Parking",
      "date": "2024-09-10",
      "index": 9
    },
    {
      "_id": "tx11",
      "money": "80",
      "tag": "Internet",
      "date": "2024-09-11",
      "index": 10
    },
    {
      "_id": "tx12",
      "money": "110",
      "tag": "Pharmacy",
      "date": "2024-09-12",
      "index": 11
    },
    {
      "_id": "tx13",
      "money": "75",
      "tag": "Cinema",
      "date": "2024-09-13",
      "index": 12
    },
    {
      "_id": "tx14",
      "money": "130",
      "tag": "Insurance",
      "date": "2024-09-14",
      "index": 13
    },
    {
      "_id": "tx15",
      "money": "55",
      "tag": "Haircut",
      "date": "2024-09-15",
      "index": 14
    },
    {
      "_id": "tx16",
      "money": "200",
      "tag": "Travel",
      "date": "2024-09-16",
      "index": 15
    },
    {
      "_id": "tx17",
      "money": "90",
      "tag": "Phone Bill",
      "date": "2024-09-17",
      "index": 16
    },
    {
      "_id": "tx18",
      "money": "60",
      "tag": "Laundry",
      "date": "2024-09-18",
      "index": 17
    },
    {
      "_id": "tx19",
      "money": "40",
      "tag": "Books",
      "date": "2024-09-19",
      "index": 18
    },
    {
      "_id": "tx20",
      "money": "85",
      "tag": "Miscellaneous",
      "date": "2024-09-20",
      "index": 19
    }
  ],
  "index": 0
}, {
  "_id": "2",
  "name": "Jane Smith",
  "type": TableType.Income,
  "txs": [
    {
      "_id": "tx21",
      "money": "3000",
      "tag": "Salary",
      "date": "2024-09-01",
      "index": 0
    },
    {
      "_id": "tx22",
      "money": "500",
      "tag": "Freelance",
      "date": "2024-09-02",
      "index": 1
    },
    {
      "_id": "tx23",
      "money": "200",
      "tag": "Bonus",
      "date": "2024-09-03",
      "index": 2
    },
    {
      "_id": "tx24",
      "money": "150",
      "tag": "Gift",
      "date": "2024-09-04",
      "index": 3
    },
    {
      "_id": "tx25",
      "money": "1000",
      "tag": "Investment",
      "date": "2024-09-05",
      "index": 4
    },
    {
      "_id": "tx26",
      "money": "300",
      "tag": "Commission",
      "date": "2024-09-06",
      "index": 5
    },
    {
      "_id": "tx27",
      "money": "1200",
      "tag": "Contract",
      "date": "2024-09-07",
      "index": 6
    },
    {
      "_id": "tx28",
      "money": "500",
      "tag": "Royalties",
      "date": "2024-09-08",
      "index": 7
    },
    {
      "_id": "tx29",
      "money": "400",
      "tag": "Dividend",
      "date": "2024-09-09",
      "index": 8
    },
    {
      "_id": "tx30",
      "money": "800",
      "tag": "Rental Income",
      "date": "2024-09-10",
      "index": 9
    },
    {
      "_id": "tx31",
      "money": "700",
      "tag": "Project Payment",
      "date": "2024-09-11",
      "index": 10
    },
    {
      "_id": "tx32",
      "money": "100",
      "tag": "Sales",
      "date": "2024-09-12",
      "index": 11
    },
    {
      "_id": "tx33",
      "money": "250",
      "tag": "Referral Fee",
      "date": "2024-09-13",
      "index": 12
    },
    {
      "_id": "tx34",
      "money": "600",
      "tag": "Consulting",
      "date": "2024-09-14",
      "index": 13
    },
    {
      "_id": "tx35",
      "money": "500",
      "tag": "Interest",
      "date": "2024-09-15",
      "index": 14
    },
    {
      "_id": "tx36",
      "money": "350",
      "tag": "Side Job",
      "date": "2024-09-16",
      "index": 15
    },
    {
      "_id": "tx37",
      "money": "450",
      "tag": "Teaching",
      "date": "2024-09-17",
      "index": 16
    },
    {
      "_id": "tx38",
      "money": "300",
      "tag": "Web Design",
      "date": "2024-09-18",
      "index": 17
    },
    {
      "_id": "tx39",
      "money": "150",
      "tag": "Affiliate Income",
      "date": "2024-09-19",
      "index": 18
    },
    {
      "_id": "tx40",
      "money": "200",
      "tag": "Sponsorship",
      "date": "2024-09-20",
      "index": 19
    }
  ],
  "index": 1
}, {
  "_id": "3",
  "name": "Alice Johnson",
  "type": TableType.Expense,
  "txs": [
    {
      "_id": "tx41",
      "money": "110",
      "tag": "Groceries",
      "date": "2024-09-01",
      "index": 0
    },
    {
      "_id": "tx42",
      "money": "75",
      "tag": "Coffee",
      "date": "2024-09-02",
      "index": 1
    },
    {
      "_id": "tx43",
      "money": "65",
      "tag": "Fuel",
      "date": "2024-09-03",
      "index": 2
    },
    {
      "_id": "tx44",
      "money": "180",
      "tag": "Rent",
      "date": "2024-09-04",
      "index": 3
    },
    {
      "_id": "tx45",
      "money": "85",
      "tag": "Utilities",
      "date": "2024-09-05",
      "index": 4
    },
    {
      "_id": "tx46",
      "money": "120",
      "tag": "Clothing",
      "date": "2024-09-06",
      "index": 5
    },
    {
      "_id": "tx47",
      "money": "55",
      "tag": "Dining Out",
      "date": "2024-09-07",
      "index": 6
    },
    {
      "_id": "tx48",
      "money": "90",
      "tag": "Books",
      "date": "2024-09-08",
      "index": 7
    },
    {
      "_id": "tx49",
      "money": "100",
      "tag": "Gym Membership",
      "date": "2024-09-09",
      "index": 8
    },
    {
      "_id": "tx50",
      "money": "40",
      "tag": "Parking",
      "date": "2024-09-10",
      "index": 9
    },
    {
      "_id": "tx51",
      "money": "80",
      "tag": "Internet",
      "date": "2024-09-11",
      "index": 10
    },
    {
      "_id": "tx52",
      "money": "120",
      "tag": "Pharmacy",
      "date": "2024-09-12",
      "index": 11
    },
    {
      "_id": "tx53",
      "money": "70",
      "tag": "Cinema",
      "date": "2024-09-13",
      "index": 12
    },
    {
      "_id": "tx54",
      "money": "150",
      "tag": "Insurance",
      "date": "2024-09-14",
      "index": 13
    },
    {
      "_id": "tx55",
      "money": "60",
      "tag": "Haircut",
      "date": "2024-09-15",
      "index": 14
    },
    {
      "_id": "tx56",
      "money": "180",
      "tag": "Travel",
      "date": "2024-09-16",
      "index": 15
    },
    {
      "_id": "tx57",
      "money": "90",
      "tag": "Phone Bill",
      "date": "2024-09-17",
      "index": 16
    },
    {
      "_id": "tx58",
      "money": "65",
      "tag": "Laundry",
      "date": "2024-09-18",
      "index": 17
    },
    {
      "_id": "tx59",
      "money": "45",
      "tag": "Books",
      "date": "2024-09-19",
      "index": 18
    },
    {
      "_id": "tx60",
      "money": "95",
      "tag": "Miscellaneous",
      "date": "2024-09-20",
      "index": 19
    }
  ],
  "index": 2
}, {
  "_id": "4",
  "name": "Bob Williams",
  "type": TableType.Income,
  "txs": [
    {
      "_id": "tx61",
      "money": "3200",
      "tag": "Salary",
      "date": "2024-09-01",
      "index": 0
    },
    {
      "_id": "tx62",
      "money": "600",
      "tag": "Freelance",
      "date": "2024-09-02",
      "index": 1
    },
    {
      "_id": "tx63",
      "money": "250",
      "tag": "Bonus",
      "date": "2024-09-03",
      "index": 2
    },
    {
      "_id": "tx64",
      "money": "175",
      "tag": "Gift",
      "date": "2024-09-04",
      "index": 3
    },
    {
      "_id": "tx65",
      "money": "1200",
      "tag": "Investment",
      "date": "2024-09-05",
      "index": 4
    },
    {
      "_id": "tx66",
      "money": "400",
      "tag": "Commission",
      "date": "2024-09-06",
      "index": 5
    },
    {
      "_id": "tx67",
      "money": "1400",
      "tag": "Contract",
      "date": "2024-09-07",
      "index": 6
    },
    {
      "_id": "tx68",
      "money": "600",
      "tag": "Royalties",
      "date": "2024-09-08",
      "index": 7
    },
    {
      "_id": "tx69",
      "money": "450",
      "tag": "Dividend",
      "date": "2024-09-09",
      "index": 8
    },
    {
      "_id": "tx70",
      "money": "900",
      "tag": "Rental Income",
      "date": "2024-09-10",
      "index": 9
    },
    {
      "_id": "tx71",
      "money": "800",
      "tag": "Project Payment",
      "date": "2024-09-11",
      "index": 10
    },
    {
      "_id": "tx72",
      "money": "150",
      "tag": "Sales",
      "date": "2024-09-12",
      "index": 11
    },
    {
      "_id": "tx73",
      "money": "300",
      "tag": "Referral Fee",
      "date": "2024-09-13",
      "index": 12
    },
    {
      "_id": "tx74",
      "money": "700",
      "tag": "Consulting",
      "date": "2024-09-14",
      "index": 13
    },
    {
      "_id": "tx75",
      "money": "600",
      "tag": "Interest",
      "date": "2024-09-15",
      "index": 14
    },
    {
      "_id": "tx76",
      "money": "400",
      "tag": "Side Job",
      "date": "2024-09-16",
      "index": 15
    },
    {
      "_id": "tx77",
      "money": "500",
      "tag": "Teaching",
      "date": "2024-09-17",
      "index": 16
    },
    {
      "_id": "tx78",
      "money": "350",
      "tag": "Web Design",
      "date": "2024-09-18",
      "index": 17
    },
    {
      "_id": "tx79",
      "money": "200",
      "tag": "Affiliate Income",
      "date": "2024-09-19",
      "index": 18
    },
    {
      "_id": "tx80",
      "money": "250",
      "tag": "Sponsorship",
      "date": "2024-09-20",
      "index": 19
    }
  ],
  "index": 3
}, {
  "_id": "5",
  "name": "Charlie Brown",
  "type": TableType.Expense,
  "txs": [
    {
      "_id": "tx81",
      "money": "130",
      "tag": "Groceries",
      "date": "2024-09-01",
      "index": 0
    },
    {
      "_id": "tx82",
      "money": "90",
      "tag": "Coffee",
      "date": "2024-09-02",
      "index": 1
    },
    {
      "_id": "tx83",
      "money": "70",
      "tag": "Fuel",
      "date": "2024-09-03",
      "index": 2
    },
    {
      "_id": "tx84",
      "money": "200",
      "tag": "Rent",
      "date": "2024-09-04",
      "index": 3
    },
    {
      "_id": "tx85",
      "money": "100",
      "tag": "Utilities",
      "date": "2024-09-05",
      "index": 4
    },
    {
      "_id": "tx86",
      "money": "150",
      "tag": "Clothing",
      "date": "2024-09-06",
      "index": 5
    },
    {
      "_id": "tx87",
      "money": "60",
      "tag": "Dining Out",
      "date": "2024-09-07",
      "index": 6
    },
    {
      "_id": "tx88",
      "money": "95",
      "tag": "Books",
      "date": "2024-09-08",
      "index": 7
    },
    {
      "_id": "tx89",
      "money": "110",
      "tag": "Gym Membership",
      "date": "2024-09-09",
      "index": 8
    },
    {
      "_id": "tx90",
      "money": "50",
      "tag": "Parking",
      "date": "2024-09-10",
      "index": 9
    },
    {
      "_id": "tx91",
      "money": "85",
      "tag": "Internet",
      "date": "2024-09-11",
      "index": 10
    },
    {
      "_id": "tx92",
      "money": "120",
      "tag": "Pharmacy",
      "date": "2024-09-12",
      "index": 11
    },
    {
      "_id": "tx93",
      "money": "70",
      "tag": "Cinema",
      "date": "2024-09-13",
      "index": 12
    },
    {
      "_id": "tx94",
      "money": "140",
      "tag": "Insurance",
      "date": "2024-09-14",
      "index": 13
    },
    {
      "_id": "tx95",
      "money": "65",
      "tag": "Haircut",
      "date": "2024-09-15",
      "index": 14
    },
    {
      "_id": "tx96",
      "money": "210",
      "tag": "Travel",
      "date": "2024-09-16",
      "index": 15
    },
    {
      "_id": "tx97",
      "money": "95",
      "tag": "Phone Bill",
      "date": "2024-09-17",
      "index": 16
    },
    {
      "_id": "tx98",
      "money": "75",
      "tag": "Laundry",
      "date": "2024-09-18",
      "index": 17
    },
    {
      "_id": "tx99",
      "money": "50",
      "tag": "Books",
      "date": "2024-09-19",
      "index": 18
    },
    {
      "_id": "tx100",
      "money": "100",
      "tag": "Miscellaneous",
      "date": "2024-09-20",
      "index": 19
    }
  ],
  "index": 4
}] 
