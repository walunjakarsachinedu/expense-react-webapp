import { Divider } from "primereact/divider";
import TxTag from "./TxTag";
import './PersonTxsComp.css';

export default function PersonTxsComp({ name, txs, onItemAdd }: PersonTx & {onItemAdd: (name: string) => void}) {
  const total = txs.reduce((acc, cur) => (acc??0) + (cur.money??0), 0);
  return <div className="PersonTxsComp">
    <div className="flex justify-content-between align-items-center">
      <div className="mr-2"> {name} : {total}/-  </div>
      <div className="mr-2 pi pi-plus icon-btn add-btn" onClick={() => onItemAdd(name)}></div>
    </div>
    <br />
    <div className="flex align-items-center flex-wrap gap-2">
      {txs.map(e => <TxTag {...e} ></TxTag>)}
    </div>
    <br />
    <Divider className="mt-2"></Divider>
  </div>;
}