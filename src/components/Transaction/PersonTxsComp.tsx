import { Divider } from "primereact/divider";
import useExpenseStore from "../../store/usePersonStore";
import { PersonTx, TableType } from "../../types/Transaction";
import { utils } from "../../utils/Utility";
import "./PersonTxsComp.css";
import TxTag from "./TxTag";

type Props = {
  id: string;
};
export default function PersonTxsComp({ id }: Props) {
  const person = useExpenseStore(
    (store) => store.persons.filter((person) => person._id === id)[0]
  );
  const addExpense = useExpenseStore((store) => store.addExpense);

  const total = person.txs.reduce(
    (total, tx) => total + (utils.parseNumber(tx.money) ?? 0),
    0
  );

  const tags = (person: PersonTx) =>
    person.txs.map((tx) => (
      <TxTag
        key={tx._id}
        _id={tx._id}
        money={tx.money}
        tag={tx.tag}
        index={tx.index}
        personId={person?._id ?? ""}
      ></TxTag>
    ));

  const addButton = (
    <div
      className="mr-2 pi pi-plus icon-btn add-btn"
      onClick={() => {
        addExpense(id);
      }}
    ></div>
  );

  return person ? (
    <div className="PersonTxsComp">
      <div className="flex justify-content-between align-items-center">
        <div className="mr-2">
          {person.name} : {total}/-
        </div>
        {addButton}
      </div>
      <br />
      <div className="flex align-items-center flex-wrap gap-2">
        {tags(person)}
      </div>
      <br />
      <Divider className="mt-2"></Divider>
    </div>
  ) : (
    <div></div>
  );
}
