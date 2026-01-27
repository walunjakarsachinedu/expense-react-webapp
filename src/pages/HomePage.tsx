import { useState } from "react";
import CenteredContent from "../components/common/CenteredContent";
import Switch from "../components/common/Switch";
import ConflictResolutionDialog from "../components/ConflictResolutionDialog";
import MonthlyNotes from "../components/MonthlyNotes";
import ExpensePanel from "../components/Transaction/ExpensePanel";
import TxSummary from "../components/Transaction/TxSummary";
import useMonthExpense from "../hooks/useMonthExpense";
import { TxType } from "../models/type";
import DayRangeFilter from "../components/common/DayRangeFilter";
import InlineSwitch from "../components/common/InlineSwitch";

const HomePage = () => {
  const { isLoading, error } = useMonthExpense();
  const [viewType, setViewType] = useState<"month"|"notes">("month");

  if (isLoading) return <div className="text-center m-5">Loading data...</div>;
  if (error) throw error;

  return (
    <>
      <CenteredContent>
        <div className="mb-2 flex flex-wrap justify-content-end align-items-center column-gap-2 row-gap-3">
          {viewType == "month" && <DayRangeFilter></DayRangeFilter>}
          <InlineSwitch 
            values={[{label: "View expense", key: 'month'}, {label: 'View notes', key: 'notes'}]} 
            selectedValue={viewType} 
            onSelect={(value:string) => setViewType(value as "month"|"notes")}
            className="ml-2"
          ></InlineSwitch>
        </div>
      </CenteredContent>
      {
        viewType == 'month' 
          ? <>
            <TxSummary></TxSummary>
            <br />
            <ExpensePanel type={TxType.Expense}></ExpensePanel>
            <br />
            <ExpensePanel type={TxType.Income}></ExpensePanel>
            <br />
            <ExpensePanel type={TxType.UpcomingExpense}></ExpensePanel>
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
