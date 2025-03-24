import ConflictResolutionDialog from "../components/ConflictResolutionDialog";
import ExpensePanel from "../components/Transaction/ExpensePanel";
import TxSummary from "../components/Transaction/TxSummary";
import useMonthExpense from "../hooks/useMonthExpense";
import { TxType } from "../models/type";

const HomePage = () => {
  const { isLoading, error } = useMonthExpense();

  if (isLoading) return <div className="text-center m-5">Loading data...</div>;
  if (error) throw error;

  return (
    <>
      <TxSummary></TxSummary>
      <br /> <br />
      <ExpensePanel type={TxType.Expense}></ExpensePanel>
      <br /> <br />
      <ExpensePanel type={TxType.Income}></ExpensePanel>
      <br /> <br />
      <ConflictResolutionDialog />
    </>
  );
};

export default HomePage;
