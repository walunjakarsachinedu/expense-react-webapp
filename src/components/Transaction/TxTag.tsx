import { produce } from "immer";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { memo, useRef, useState } from "react";
import useExpenseStore from "../../store/usePersonStore";
import utils from "../../utils/utils";
import EditableElem from "../common/EditableElement";
import "./TxTag.css";

type Props = {
  id: string;
  personId: string;
  /** Always true if showAsDeleted internal state is true */
  makeReadOnly?: boolean;
  conflictMode?: boolean;
  alwaysShowAsDeleted?: boolean;
};

const TxTag = memo(
  ({
    id,
    personId,
    makeReadOnly = false,
    conflictMode = false,
    alwaysShowAsDeleted = false,
  }: Props) => {
    const tx = useExpenseStore((store) => store.persons[personId].txs[id]);
    const updateExpense = useExpenseStore((store) => store.updateExpense);
    const deleteExpense = useExpenseStore((store) => store.deleteExpense);
    const delayDebounceTimer = useExpenseStore(
      (store) => store.delayDebounceTimer
    );

    const conflicts = useExpenseStore((store) => store.conflicts);
    const conflict = conflicts?.find((conflict) => conflict._id == personId);
    const [showAsDeleted, setShowAsDeleted] = useState(
      conflict?.toDelete ?? false
    );

    const isDeleted = alwaysShowAsDeleted || showAsDeleted;

    const showDeleteCheckBox =
      conflictMode &&
      !conflict?.isDeleted &&
      conflict?.txs?.find((tx) => tx._id == id && tx.isDeleted);

    if (conflictMode || showDeleteCheckBox || isDeleted) {
      makeReadOnly = true;
    }

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const moneyValue = useRef(tx.money);
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

    const onCheckboxToggle = (isChecked: boolean) => {
      setShowAsDeleted(isChecked);
      if (!conflict) return;

      useExpenseStore.setState({
        conflicts: produce(conflicts, (draft) => {
          const conflict = draft?.find((el) => el._id == personId);
          const txConflict = conflict?.txs?.find((el) => el._id == id);
          if (txConflict) txConflict.toDelete = isChecked;
          return draft;
        }),
      });
    };

    return (
      <div
        className={`Tag relative 
        ${makeReadOnly ? "readonly" : ""} ${isDeleted ? "deleted" : ""}`}
      >
        <Tag
          style={{
            border:
              "solid 1px var(" +
              (isEditing
                ? "--surface-border-highlighted"
                : "--surface-border") +
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
              isReadonly={makeReadOnly || isDeleted}
              onFocus={() => {
                setIsEditing(true);
                delayDebounceTimer();
              }}
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
              initialText={`${tx.money ?? ""}`}
              placeHolder="money"
              preventNewline={true}
              numberOnly={true}
              isReadonly={makeReadOnly || isDeleted}
              onFocus={() => {
                setIsEditing(true);
                delayDebounceTimer();
              }}
              onBlur={() => setIsEditing(false)}
              onKeyUp={(e) => {
                const target = e.target as HTMLElement;
                moneyValue.current = utils.parseNumber(
                  target.textContent ?? ""
                );
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
            {!alwaysShowAsDeleted && showDeleteCheckBox && (
              <Checkbox
                value="deleted"
                className="delete-checkbox"
                checked={showAsDeleted}
                onClick={() => onCheckboxToggle(!showAsDeleted)}
                style={{ transform: "scale(0.60)", transformOrigin: "center" }}
              />
            )}
          </div>
        </Tag>
      </div>
    );
  }
);

export default TxTag;
