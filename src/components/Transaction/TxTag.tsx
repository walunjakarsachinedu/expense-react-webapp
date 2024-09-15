import { Tag } from "primereact/tag";
import "./TxTag.css";
import { KeyboardEvent, useState } from "react";
import getKeyName from "../../utils/keyboard";
import TxTagService from "../../services/implemenation/TxTagService";
import { Tx } from "../../types/Transaction";

type TxTagInput = Tx & {personId: String, onTagDelete: (tagId: String) => void}

export default function TxTag({_id, money, tag, personId, onTagDelete} : TxTagInput) {
  const [isEditing, setIsEditing] = useState<boolean>(false);

  const saveState = async () => {
    await TxTagService.provider.update({_id, money, tag}, personId);
  }

  const deleteTag = () => {
    onTagDelete(_id);
  }

  const preventNewLine = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter') event.preventDefault();
  }

  const preventAtoZ = (event: KeyboardEvent<HTMLSpanElement>) => {
    const code = getKeyName(event.code);
    if(code.length === 1 && /[a-z]/.test(code)) event.preventDefault();
  };

  return (
    <div className="Tag relative">
      <Tag 
        style={{
          border: "solid 1px var(" + (isEditing ? "--surface-border-highlighted" : "--surface-border") + ")", 
          backgroundColor: 'var(--highlight-bg)', 
          color: "var(--text-color)"
      }}>
        <div className="flex align-items-center" style={{fontSize: 12, fontWeight: "normal" }}>
          <span 
            onFocus={() => setIsEditing(true)}
            onBlur={() => {
              setIsEditing(false);
              saveState();
            }}
            onKeyDown={(e) => {preventNewLine(e);}}
            contentEditable suppressContentEditableWarning 
            data-placeholder="tag"
          >{tag ?? ""}</span> 
          <div 
            style={{
              height: "10px", width: "1px", 
              backgroundColor: "var(--surface-border)", 
              marginRight: 5, marginLeft: 5
          }}></div>
          <span 
            onFocus={() => setIsEditing(true)}
            onBlur={() => {
              setIsEditing(false);
              saveState();
            }}
            onKeyDown={(e) => {preventNewLine(e); preventAtoZ(e);}}
            contentEditable suppressContentEditableWarning 
            data-placeholder="money"
          >{money ?? ""}</span> 
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


