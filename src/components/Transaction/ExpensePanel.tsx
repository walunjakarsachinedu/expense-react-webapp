import { Button } from "primereact/button";
import { Panel } from "primereact/panel";
import useExpenseStore from "../../store/usePersonStore";
import PersonTxs from "./PersonTxs";
import { TxType } from "../../models/type";
import useTxTotal from "../../hooks/useTxTotal";
import utils from "../../utils/utils";
import CenteredContent from "../common/CenteredContent";

type Props = {
  type: TxType;
};

const ExpensePanel = ({ type }: Props) => {
  const personIds = useExpenseStore((store) => store.personIds).filter(
    (person) => person.type == type
  );
  const addPerson = useExpenseStore((store) => store.addPerson);

  const personList = personIds.map((person) => (
    <PersonTxs key={person.id} id={person.id}></PersonTxs>
  ));

  return (
    <CenteredContent>
      <Panel
        headerTemplate={
          <div className="p-panel-header flex justify-content-between align-items-center">
            <div className="font-bold	">
              {type == TxType.Expense ? "Expense" : "Income"} History{" "}
            </div>
            <div className="flex align-items-center">
              <div className="pi pi-cog"></div>
              <div className="mx-3"></div>
              <ExpenseTotal type={type}></ExpenseTotal>
            </div>
          </div>
        }
      >
        <div className="m-0 p-4 pb-2">{personList}</div>
        <Button
          className="m-4 mt-0"
          outlined
          size="small"
          onClick={() => addPerson(type)}
        >
          Add Person
        </Button>
      </Panel>
    </CenteredContent>
  );
};

const ExpenseTotal = ({ type }: Props) => {
  const total = useTxTotal(type);

  return <div className="mr-1">Total: {utils.formatNumber(total)}/-</div>;
};

export default ExpensePanel;
