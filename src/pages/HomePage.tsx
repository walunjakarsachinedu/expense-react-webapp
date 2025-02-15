import ExpensePanel from "../components/Transaction/ExpensePanel";
import useMonthExpense from "../hooks/useMonthExpense";

const HomePage = () => {
  const { isLoading, error } = useMonthExpense();

  if (isLoading) return <div className="text-center m-5">Loading data...</div>;
  if (error) throw error;

  return (
    <>
      <ExpensePanel></ExpensePanel>
      <br /> <br />
    </>
  );
};

export default HomePage;
