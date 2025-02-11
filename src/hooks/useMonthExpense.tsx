import { useQuery } from "@tanstack/react-query";
import MonthExpenseRepository from "../api/MonthExpenseRepository";
import { PersonData } from "../models/type";
import useExpenseStore from "../store/usePersonStore";

const useMonthExpense = (monthYear: string) => {
  const setMonthData = useExpenseStore((store) => store.setMonthData);

  return useQuery<PersonData[]>({
    queryKey: ["monthExpense"],
    queryFn: () => MonthExpenseRepository.provider.getMonthExpense(),
    onSuccess: (persons) => setMonthData(monthYear, persons),
  });
};

export default useMonthExpense;
