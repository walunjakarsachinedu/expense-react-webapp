import { useQuery } from "@tanstack/react-query";
import MonthExpenseApi from "../api/MonthExpenseApi";
import { Person } from "../models/Person";
import useExpenseStore from "../store/usePersonStore";
import Tx from "../models/Tx";

const useMonthExpense = (monthYear: string) => {
  const setMonthData = useExpenseStore((store) => store.setMonthData);
  return useQuery<Person[]>({
    queryKey: ["monthExpense"],
    queryFn: () =>
      MonthExpenseApi.provider.getMonthExpense().then((persons) =>
        persons.map<Person>((person) => ({
          ...person,
          txs: person.txs.reduce<Record<string, Tx>>(
            (txMap, tx) => ({ ...txMap, [tx._id]: tx }),
            {}
          ),
          txIds: person.txs
            .sort((a, b) => a.index - b.index)
            .map((tx) => tx._id),
        }))
      ),
    onSuccess: (persons) => setMonthData(monthYear, persons),
  });
};

export default useMonthExpense;
