import { monthExpenseRepository } from "../api/repository/MonthExpenseRepository";
import useExpenseStore from "../store/usePersonStore";
import usePromise from "./usePromise";

const useMonthExpense = () => {
  const monthYear = useExpenseStore((store) => store.monthYear);

  return usePromise<void>({
    dependencies: ["monthExpense", monthYear],
    asyncFn: () => monthExpenseRepository.fetchMonthData(monthYear),
  });
};

export default useMonthExpense;
