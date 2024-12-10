import { Tag } from "primereact/tag";
import { useRef, useState } from "react";
import useExpenseStore from "../../store/usePersonStore";
import EditableElem from "../common/EditableElement";
import "./TxTag.css";

type Props = { id: string; personId: string };

const TxTag = ({ id, personId }: Props) => {
  const tx = useExpenseStore((store) => store.persons[personId].txs[id]);
  const updateExpense = useExpenseStore((store) => store.updateExpense);
  const deleteExpense = useExpenseStore((store) => store.deleteExpense);

  const [isEditing, setIsEditing] = useState<boolean>(false);
  const moneyValue = useRef(tx.money ?? "");
  const tagValue = useRef(tx.tag);

  const saveState = async () => {
    updateExpense(id, personId, {
      money: moneyValue.current,
      tag: tagValue.current,
    });
  };

  const deleteTag = () => {
    deleteExpense(id, personId);
  };

  return (
    <div className="Tag relative">
      <Tag
        style={{
          border:
            "solid 1px var(" +
            (isEditing ? "--surface-border-highlighted" : "--surface-border") +
            ")",
          backgroundColor: "var(--highlight-bg)",
          color: "var(--text-color)",
        }}
      >
        <div
          className="flex align-items-center"
          style={{ fontSize: 12, fontWeight: "normal" }}
        >
          <EditableElem
            initialText={tx.tag}
            placeHolder="tag"
            preventNewline={true}
            trimInput={true}
            maxCharacter={24}
            onFocus={() => setIsEditing(true)}
            onBlur={(e) => setIsEditing(false)}
            onKeyUp={(e) => {
              const target = e.target as HTMLElement;
              tagValue.current = target.textContent ?? "";
              saveState();
            }}
          ></EditableElem>
          <div
            style={{
              height: "10px",
              width: "1px",
              backgroundColor: "var(--surface-border)",
              marginRight: 5,
              marginLeft: 5,
            }}
          ></div>
          <EditableElem
            initialText={tx.money}
            placeHolder="money"
            preventNewline={true}
            numberOnly={true}
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
            style={{ color: "var(--text-unselectable)" }}
          >
            &nbsp;/-
          </span>
          {isEditing ? (
            <span
              onMouseDown={deleteTag}
              className="remove-btn pi pi-times hover-grow"
            ></span>
          ) : (
            ""
          )}
        </div>
      </Tag>
    </div>
  );
};

export default TxTag;
