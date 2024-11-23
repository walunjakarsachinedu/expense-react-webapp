import { Panel } from "primereact/panel";
import useExpenseStore from "../../store/usePersonStore";
import { TableType } from "../../types/Transaction";
import { utils } from "../../utils/Utility";
import PersonTxsComp from "./PersonTxsComp";

export default function ExpensePanel() {
  const persons = useExpenseStore((store) => store.persons);

  const personList = persons
    .filter((person) => person.type === TableType.Expense)
    .map((person) => (
      <PersonTxsComp key={person._id} id={person._id}></PersonTxsComp>
    ));

  const total = persons.reduce(
    (total, person) =>
      total +
      person.txs.reduce(
        (total, tx) => total + (utils.parseNumber(tx.money) ?? 0),
        0
      ),
    0
  );
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
                  <div> Total: {total}/- </div>
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
}
