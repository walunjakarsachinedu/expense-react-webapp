import { Tag } from "primereact/tag";

export default function TransactionTag({money, tag}: {money: number, tag: string}) {
  return (
    <div className="Tag">
      <Tag 
        style={{
          border: "solid 1px var(--surface-border)", 
          backgroundColor: 'var(--highlight-bg)', color: "white"
      }}>
        <div className="flex align-items-center" style={{fontSize: 12, fontWeight: "normal" }}>
          <span 
            contentEditable suppressContentEditableWarning 
            data-placeholder="tag"
          >{tag}</span> 
          <div 
            style={{
              height: "10px", width: "1px", 
              backgroundColor: "rgba(255,255,255,0.3)", 
              marginRight: 5, marginLeft: 5
          }}></div>
          <span 
            contentEditable suppressContentEditableWarning 
            data-placeholder="money"
          >{money}</span> 
          <span 
            className="unselectable" 
            style={{color: "rgba(255,255,255,0.85)"}}
          >&nbsp;/-</span>
        </div>
      </Tag>
    </div>
  );
}


