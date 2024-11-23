import { useQuery } from "@tanstack/react-query";
import MonthExpenseApi from "../api/MonthExpenseApi";
import { Person } from "../models/Person";
import useExpenseStore from "../store/usePersonStore";

const useMonthExpense = (monthYear: string) => {
  const setMonthData = useExpenseStore((store) => store.setMonthData);
  return useQuery<Person[]>({
    queryKey: ["monthExpense"],
    queryFn: () => MonthExpenseApi.provider.getMonthExpense(),
    onSuccess: (persons) => setMonthData(monthYear, persons),
  });
};

export default useMonthExpense;
