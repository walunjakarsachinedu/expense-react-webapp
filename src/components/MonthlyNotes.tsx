import useExpenseStore from "../store/usePersonStore";
import PlainTextEditor from "./common/PlainTextEditor"

function MonthlyNotes() {
  const monthlyNotes = useExpenseStore((store) => store.monthlyNotes.notes);
  const updateNotes = useExpenseStore((store) => store.updateMonthlyNotes);
  return (
    <PlainTextEditor 
      placeholderText="Enter notes..."
      value={monthlyNotes} 
      onChange={updateNotes}
    ></PlainTextEditor>
  )
}

export default MonthlyNotes