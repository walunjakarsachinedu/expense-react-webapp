import { monthExpenseRepository } from "../api/repository/MonthExpenseRepository";
import { PersonData } from "../models/type";
import useExpenseStore from "../store/usePersonStore";
import usePromise from "./usePromise";

const useMonthExpense = () => {
  const monthYear = useExpenseStore((store) => store.monthYear);
  const setMonthData = useExpenseStore((store) => store.setMonthData);

  return usePromise<PersonData[]>({
    dependencies: ["monthExpense", monthYear],
    asyncFn: () => monthExpenseRepository.getMonthExpense(monthYear),
    onResolve: (persons) => setMonthData(monthYear, persons),
  });
};

export default useMonthExpense;
