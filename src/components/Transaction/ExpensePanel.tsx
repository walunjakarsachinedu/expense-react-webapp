import { Panel } from "primereact/panel";
import useExpenseStore from "../../store/usePersonStore";
import PersonTxs from "./PersonTxs";
import { utils } from "../../utils/Utility";
import { Button } from "primereact/button";
import { TableType } from "../../types/Transaction";

const ExpensePanel = () => {
  const personIds = useExpenseStore((store) => store.personIds);
  const addPerson = useExpenseStore((store) => store.addPerson);

  const personList = personIds.map((personId) => (
    <PersonTxs key={personId} id={personId}></PersonTxs>
  ));

  return (
    <div>
      <div className="flex justify-content-center align-items-center flex-wrap">
        <div className="col-12 md:col-10" style={{ maxWidth: 1000 }}>
          <Panel
            headerTemplate={
              <div className="p-panel-header flex justify-content-between align-items-center">
                <div> Expense History </div>
                <div className="flex align-items-center">
                  <div className="pi pi-cog"></div>
                  <div className="mx-3"></div>
                  <ExpenseTotal></ExpenseTotal>
                </div>
              </div>
            }
          >
            <div className="m-0 p-4 pb-2">{personList}</div>
            <Button
              className="m-4 mt-0"
              outlined
              size="small"
              onClick={() => addPerson(TableType.Expense)}
            >
              Add Person
            </Button>
          </Panel>
        </div>
      </div>
    </div>
  );
};

const ExpenseTotal = () => {
  const persons = useExpenseStore((store) => store.persons);

  const total = Object.values(persons).reduce(
    (total, person) =>
      total +
      Object.values(person.txs).reduce(
        (total, tx) => total + (utils.parseNumber(tx.money) ?? 0),
        0
      ),
    0
  );

  return <div className="mr-1">Total: {total}/-</div>;
};

export default ExpensePanel;
