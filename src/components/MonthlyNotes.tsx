import useExpenseStore from "../store/usePersonStore";
import MarkdownEditor from "./common/MarkdownEditor"

function MonthlyNotes() {
  const monthlyNotes = useExpenseStore((store) => store.monthlyNotes.notes);
  const updateNotes = useExpenseStore((store) => store.updateMonthlyNotes);
  return (
    <MarkdownEditor
      placeholderText="Enter notes..."
      initialValue={monthlyNotes} 
      onChange={updateNotes}
    ></MarkdownEditor>
  )
}

export default MonthlyNotes