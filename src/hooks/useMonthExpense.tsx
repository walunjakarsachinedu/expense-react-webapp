import { useQuery } from "@tanstack/react-query";
import MonthExpenseRepository from "../api/MonthExpenseRepository";
import { Person } from "../models/Person";
import useExpenseStore from "../store/usePersonStore";
import { utils } from "../utils/Utility";

const useMonthExpense = (monthYear: string) => {
  const setMonthData = useExpenseStore((store) => store.setMonthData);

  return useQuery<Person[]>({
    queryKey: ["monthExpense"],
    queryFn: () => MonthExpenseRepository.provider.getMonthExpense(),
    onSuccess: (persons) => setMonthData(monthYear, persons),
  });
};

export default useMonthExpense;
