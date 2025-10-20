import useExpenseStore from "../store/usePersonStore";
import PlainTextEditor from "./common/PlainTextEditor"

function MonthlyNotes() {
  const monthlyNotes = useExpenseStore((store) => store.monthlyNotes);
  const updateNotes = useExpenseStore((store) => store.updateMonthlyNotes);
  return (
    <PlainTextEditor 
      placeholderText="Enter notes..."
      value={monthlyNotes.notes} 
      onChange={updateNotes}
    ></PlainTextEditor>
  )
}

export default MonthlyNotes