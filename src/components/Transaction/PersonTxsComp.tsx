import { Divider } from "primereact/divider";
import TxTag from "./TxTag";

export default function PersonTxsComp({ name, txs }: PersonTx) {
  const total = txs.reduce((acc, cur) => (acc??0) + (cur.money??0), 0);
  return <div 
  >
    <div className="mr-2"> 
      {name} : {total}/-  
    </div>
    <br />
    <div className="flex align-items-center flex-wrap gap-2">
      {txs.map(e => <TxTag {...e} ></TxTag>)}
    </div>
    <br />
    <Divider className="mt-2"></Divider>
  </div>;
}