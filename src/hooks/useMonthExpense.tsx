import { useQuery } from "@tanstack/react-query";
import MonthExpenseRepository from "../api/MonthExpenseRepository";
import { PersonData } from "../models/type";
import useExpenseStore from "../store/usePersonStore";

const useMonthExpense = () => {
  const monthYear = useExpenseStore((store) => store.monthYear);
  const setMonthData = useExpenseStore((store) => store.setMonthData);

  return useQuery<PersonData[]>({
    queryKey: ["monthExpense", monthYear],
    queryFn: () => MonthExpenseRepository.provider.getMonthExpense(monthYear),
    onSuccess: (persons) => setMonthData(monthYear, persons),
  });
};

export default useMonthExpense;
