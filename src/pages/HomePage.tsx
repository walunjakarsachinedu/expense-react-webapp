import ExpensePanel from "../components/Transaction/ExpensePanel";
import useMonthExpense from "../hooks/useMonthExpense";
import { TxType } from "../models/type";

const HomePage = () => {
  const { isLoading, error } = useMonthExpense();

  if (isLoading) return <div className="text-center m-5">Loading data...</div>;
  if (error) throw error;

  return (
    <>
      <ExpensePanel type={TxType.Expense}></ExpensePanel>
      <br /> <br /> <br />
      <ExpensePanel type={TxType.Income}></ExpensePanel>
      <br /> <br />
    </>
  );
};

export default HomePage;
