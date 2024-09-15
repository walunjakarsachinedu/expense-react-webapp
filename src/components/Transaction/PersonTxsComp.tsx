import { Divider } from "primereact/divider";
import TxTag from "./TxTag";
import './PersonTxsComp.css';
import { useEffect, useState } from "react";
import PersonExpenseService from "../../services/implemenation/PersonExpenseService";
import Utility from "../../utils/Utility";
import TxTagService from "../../services/implemenation/TxTagService";
import { PersonTx } from "../../types/Transaction";

export default function PersonTxsComp({id}: {id: String}) {
  const [person, setPerson] = useState<PersonTx|undefined>();
  const total = Utility.provider.txsTotal(person?.txs??[]);
  const name = person?.name ?? ""; 

  useEffect(() => {
    const person = PersonExpenseService.provider.get(id);
    setPerson(person);
  }, [id]);

  const onItemAdd = async (personId: String) => {
    await TxTagService.provider.add(personId);
    const updatedPerson = PersonExpenseService.provider.get(personId);
    setPerson({...updatedPerson});
  }

  const onTagDelete = async (tagId: String) => {
    await TxTagService.provider.delete(tagId, person!._id);
    const updatedPerson = PersonExpenseService.provider.get(person!._id);
    setPerson({...updatedPerson});
  }

  const tags = (person?.txs ?? []).map((tx) => 
    <TxTag 
      key={tx._id.toString()}
      _id={tx._id} 
      money={tx.money} 
      tag={tx.tag} 
      personId={person?._id??""}
      onTagDelete={onTagDelete}
    ></TxTag>
  );

  const addButton = person 
    ? <div className="mr-2 pi pi-plus icon-btn add-btn" onClick={() => onItemAdd(person!._id)}></div>
    : "";

  return <div className="PersonTxsComp">
    <div className="flex justify-content-between align-items-center">
      <div className="mr-2"> {name} : {total}/-  </div>
      { addButton }
    </div>
    <br />
    <div className="flex align-items-center flex-wrap gap-2"> {tags} </div>
    <br />
    <Divider className="mt-2"></Divider>
  </div>;
}