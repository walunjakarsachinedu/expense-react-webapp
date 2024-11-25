import { Panel } from "primereact/panel";
import useExpenseStore from "../../store/usePersonStore";
import PersonTxsComp from "./PersonTxsComp";
import { utils } from "../../utils/Utility";

const ExpensePanel = () => {
  const personIds = useExpenseStore((store) => store.personIds);

  const personList = personIds.map((personId) => (
    <PersonTxsComp key={personId} id={personId}></PersonTxsComp>
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
            <div className="m-0 p-4">{personList}</div>
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

  return <div>Total: {total}/-</div>;
};

export default ExpensePanel;
