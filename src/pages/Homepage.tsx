import ExpensePanel from "../components/Transaction/ExpensePanel";
import useMonthExpense from "../hooks/useMonthExpense";

const HomePage = () => {
  const { isLoading, error } = useMonthExpense("11-2024");

  if (isLoading) return "Loading data...";
  if (error) throw error;

  return (
    <>
      <ExpensePanel></ExpensePanel>
      <br /> <br />
    </>
  );
};

export default HomePage;
