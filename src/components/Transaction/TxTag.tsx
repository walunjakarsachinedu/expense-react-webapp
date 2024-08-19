import { Tag } from "primereact/tag";
import "./TxTag.css";
import { KeyboardEvent, useState } from "react";
import getKeyName from "../../utils/keyboard";

export default function TxTag({money, tag}: Tx) {
  const [isEditing, setIsEditing] = useState(false);

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
          border: "solid 1px var(" + (isEditing ? "--primary-color" : "--surface-border") + ")", 
          backgroundColor: 'var(--highlight-bg)', 
          color: "white"
      }}>
        <div className="flex align-items-center" style={{fontSize: 12, fontWeight: "normal" }}>
          <span 
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {preventNewLine(e);}}
            contentEditable suppressContentEditableWarning 
            data-placeholder="tag"
          >{tag ?? ""}</span> 
          <div 
            style={{
              height: "10px", width: "1px", 
              backgroundColor: "var(--surface-border1)", 
              marginRight: 5, marginLeft: 5
          }}></div>
          <span 
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => {preventNewLine(e); preventAtoZ(e);}}
            contentEditable suppressContentEditableWarning 
            data-placeholder="money"
          >{money ?? ""}</span> 
          <span 
            className="unselectable" 
            style={{color: "rgba(255,255,255,0.85)"}}
          >&nbsp;/-</span>
          {
            isEditing ?
            <span 
              className="remove-btn pi pi-times hover-grow" 
            ></span> : ""
          }
        </div>
      </Tag>
    </div>
  );
}


