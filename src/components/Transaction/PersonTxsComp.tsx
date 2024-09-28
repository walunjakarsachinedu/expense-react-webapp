import { Divider } from "primereact/divider";
import TxTag from "./TxTag";
import './PersonTxsComp.css';
import { useContext, useEffect, useState } from "react";
import Utility from "../../utils/Utility";
import { PersonContext, PersonDispatchContext } from "../../providers/PersonProvider";
import { PersonTx } from "../../types/Transaction";

export default function PersonTxsComp() {
  const [person, setPerson] = useState<PersonTx|undefined>();
  const personPromise = useContext(PersonContext);
  const personAction = useContext(PersonDispatchContext);

  useEffect(() => {
    personPromise?.then(person => {
      setPerson(person);
    });
  }, [personPromise]);

  const total = (person: PersonTx) => Utility.provider.txsTotal(person?.txs??[]);
  const name = (person: PersonTx) => person?.name ?? ""; 

  const tags = (person: PersonTx) => person.txs.map((tx) => 
    <TxTag 
      key={tx._id.toString()}
      _id={tx._id} 
      money={tx.money} 
      tag={tx.tag} 
      index={tx.index}
      personId={person?._id??""}
    ></TxTag>
  );

  const addButton = (person: PersonTx) => <div 
    className="mr-2 pi pi-plus icon-btn add-btn" 
    onClick={() => {
      personAction?.({type: "addExpense"})
    }}
  ></div>
  

  return person ? <div className="PersonTxsComp">
      <div className="flex justify-content-between align-items-center">
        <div className="mr-2"> {name(person)} : {total(person)}/-  </div>
        { addButton(person) }
      </div>
      <br />
      <div className="flex align-items-center flex-wrap gap-2"> {tags(person)} </div>
      <br />
      <Divider className="mt-2"></Divider>
    </div> : <div></div>;
}