import { Tag } from "primereact/tag";
import "./TransactionTag.css";
import { useState } from "react";

export default function TransactionTag({money, tag}: {money?: number, tag?: string}) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <div className="Tag">
      <Tag 
        style={{
          border: "solid 1px var(--surface-border)", 
          backgroundColor: 'var(--highlight-bg)', 
          color: "white"
      }}>
        <div className="flex align-items-center" style={{fontSize: 12, fontWeight: "normal" }}>
          <span 
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
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
              className="ml-2 pi pi-times hover-grow" 
              style={{
                fontSize: 9, 
                color: '#f07d79', 
                backgroundColor: "rgba(255,255,255,0.1)", 
                padding: 2, 
                borderRadius: 2,
                cursor: "pointer"
              }}
            ></span> : ""
          }
        </div>
      </Tag>
    </div>
  );
}


