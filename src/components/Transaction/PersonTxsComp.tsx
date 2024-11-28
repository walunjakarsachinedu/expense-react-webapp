import { Divider } from "primereact/divider";
import useExpenseStore from "../../store/usePersonStore";
import { utils } from "../../utils/Utility";
import SimpleContentEditable from "../common/SimpleContentEditable";
import "./PersonTxsComp.css";
import TxTag from "./TxTag";

type Props = {
  id: string;
};

const PersonTxsComp = ({ id }: Props) => {
  const addExpense = useExpenseStore((store) => store.addExpense);
  const txIds = useExpenseStore((store) => store.persons[id].txIds);

  const addButton = (
    <div
      className="mr-2 pi pi-plus icon-btn add-btn "
      onClick={() => {
        addExpense(id);
      }}
    ></div>
  );

  const txList = txIds.map((txId) => (
    <TxTag key={txId} id={txId} personId={id} />
  ));

  return (
    <div className="PersonTxsComp">
      <div className="flex justify-content-between align-items-center">
        <div className="mr-2">
          <PersonName id={id} /> <PersonTotal id={id} />
        </div>
        {addButton}
      </div>
      {txList.length > 0 ? (
        <>
          <br />
          <div className="flex align-items-center flex-wrap gap-2">
            {txList}
          </div>
          <br />
        </>
      ) : (
        <br />
      )}
      <Divider className="mt-2"></Divider>
    </div>
  );
};

const PersonName = ({ id }: Props) => {
  const name = useExpenseStore((store) => store.persons[id].name);
  const updateName = useExpenseStore((store) => store.updateName);
  return (
    <SimpleContentEditable
      initialText={name}
      placeHolder="Person Name"
      onChange={(value) => updateName(id, value)}
    />
  );
};

const PersonTotal = ({ id }: Props) => {
  const person = useExpenseStore((store) => store.persons[id]);
  const total = Object.values(person.txs).reduce(
    (total, tx) => total + (utils.parseNumber(tx.money) ?? 0),
    0
  );
  if (Object.keys(person.txs).length == 0 || total == 0) return null;
  return <>: {total}/-</>;
};

export default PersonTxsComp;
