import { Tag } from "primereact/tag";
import "./TxTag.css";
import { useContext, useRef, useState } from "react";
import { Tx } from "../../types/Transaction";
import { PersonDispatchContext } from "../../providers/PersonProvider";
import EditableElem from "../common/EditableElement";

type TxTagInput = Tx & {personId: string}

export default function TxTag({_id, money, tag, personId, index} : TxTagInput) {
  const personDispatchAction = useContext(PersonDispatchContext); 
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const moneyValue = useRef(money??"")
  const tagValue = useRef(tag)

  const saveState = async () => {
    personDispatchAction?.({type: "updateExpense", txTag: {
      _id, 
      money: moneyValue.current, 
      tag: tagValue.current, index
    }})
  }

  const deleteTag = () => {
    personDispatchAction?.({type: "removeExpense", _id: _id})
  }

  return (
    <div className="Tag relative">
      <Tag 
        style={{
          border: "solid 1px var(" + (isEditing ? "--surface-border-highlighted" : "--surface-border") + ")", 
          backgroundColor: 'var(--highlight-bg)', 
          color: "var(--text-color)"
      }}>
        <div className="flex align-items-center" style={{fontSize: 12, fontWeight: "normal" }}>
          <EditableElem
            initialText={tag}
            preventNewline={true}
            placeHolder="tag"
            onFocus={() => setIsEditing(true)}
            onBlur={(e) => {
              tagValue.current = e.target.textContent ?? "";
              setIsEditing(false);
              saveState();
            }}
          ></EditableElem>
          <div 
            style={{
              height: "10px", width: "1px", 
              backgroundColor: "var(--surface-border)", 
              marginRight: 5, marginLeft: 5
          }}></div>
          <EditableElem
            initialText={money}
            placeHolder="money"
            numberOnly={true}
            preventNewline={true}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onKeyUp={(e) => {
              const target = e.target as HTMLElement;
              moneyValue.current = target.textContent ?? "";
              saveState();
            }}
          ></EditableElem>
          <span 
            className="unselectable" 
            style={{color: "var(--text-unselectable)"}}
          >&nbsp;/-</span>
          {
            isEditing ?
            <span 
            onMouseDown={deleteTag}
              className="remove-btn pi pi-times hover-grow" 
            ></span> : ""
          }
        </div>
      </Tag>
    </div>
  );
}


