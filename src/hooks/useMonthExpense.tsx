import { useQuery } from "@tanstack/react-query";
import { Person } from "../models/Person";
import MonthExpenseApi from "../api/MonthExpenseApi";

const useMonthExpense = () =>
  useQuery<Person[]>({
    queryKey: ["monthExpense"],
    queryFn: () => MonthExpenseApi.provider.getMonthExpense(),
  });

export default useMonthExpense;
