import { useState } from "react";
import CenteredContent from "../components/common/CenteredContent";
import Switch from "../components/common/Switch";
import ConflictResolutionDialog from "../components/ConflictResolutionDialog";
import MonthlyNotes from "../components/MonthlyNotes";
import ExpensePanel from "../components/Transaction/ExpensePanel";
import TxSummary from "../components/Transaction/TxSummary";
import useMonthExpense from "../hooks/useMonthExpense";
import { TxType } from "../models/type";

const HomePage = () => {
  const { isLoading, error } = useMonthExpense();
  const [viewType, setViewType] = useState<"month"|"notes">("month");

  if (isLoading) return <div className="text-center m-5">Loading data...</div>;
  if (error) throw error;

  return (
    <>
      <CenteredContent>
        <div className="flex justify-content-end align-items-center gap-2">
          {/* <div className="text-color-secondary">View Type</div>  */}
          <Switch 
            values={['month', 'notes']} 
            defaultValue={viewType} 
            onSelect={(value:string) => setViewType(value as "month"|"notes")}
          ></Switch>
        </div>
      </CenteredContent>
      {
        viewType == 'month' 
          ? <>
            <TxSummary></TxSummary>
            <br /> <br />
            <ExpensePanel type={TxType.Expense}></ExpensePanel>
            <br /> <br />
            <ExpensePanel type={TxType.Income}></ExpensePanel>
            <br /> <br />
          </> 
          : <>
            <CenteredContent>
              <MonthlyNotes></MonthlyNotes>
            </CenteredContent>
          </>
      }
      <ConflictResolutionDialog />
    </>
  );
};

export default HomePage;
