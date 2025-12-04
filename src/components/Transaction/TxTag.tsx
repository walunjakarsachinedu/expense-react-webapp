import { produce } from "immer";
import { Checkbox } from "primereact/checkbox";
import { Tag } from "primereact/tag";
import { memo, useRef, useState } from "react";
import useClickOutside from "../../hooks/onClickOutside";
import { usePreventRightOverflow } from "../../hooks/usePreventRightOverflow";
import useExpenseStore from "../../store/usePersonStore";
import utils from "../../utils/utils";
import EditableElem from "../common/EditableElement";
import "./TxTag.scss";

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
    makeReadOnly: readOnlyMode = false,
    conflictMode = false,
    alwaysShowAsDeleted = false,
  }: Props) => {
    const tx = useExpenseStore((store) => store.persons[personId].txs[id]);
    const updateExpense = useExpenseStore((store) => store.updateExpense);
    const deleteExpense = useExpenseStore((store) => store.deleteExpense);
    const delayDebounceTimer = useExpenseStore(
      (store) => store.delayDebounceTimer
    );
    const monthYear = useExpenseStore((store) => store.monthYear);

    const conflicts = useExpenseStore((store) => store.conflicts);
    const conflict = conflicts?.find((conflict) => conflict._id == personId);
    const [showAsDeleted, setShowAsDeleted] = useState(
      conflict?.toDelete ?? false
    );

    const [showExtraInfo, setShowExtraInfo] = useState(false);
    const extraInfoRef = useRef<HTMLDivElement>(null);

    const isDeleted = alwaysShowAsDeleted || showAsDeleted;

    const showDeleteCheckBox =
      conflictMode &&
      !conflict?.isDeleted &&
      conflict?.txs?.find((tx) => tx._id == id && tx.isDeleted);

    if (conflictMode || showDeleteCheckBox || isDeleted) {
      readOnlyMode = true;
    }

    const [isEditing, setIsEditing] = useState<boolean>(false);
    const moneyValue = useRef(tx.money);
    const tagValue = useRef(tx.tag);
    const performedAt = useRef(tx.performedAt);
    const editMode = !readOnlyMode && isEditing;

    const elRef = useRef<HTMLElement>(null);

    useClickOutside({
      ref: elRef, 
      onOutsideClick: () => {setIsEditing(false); setShowExtraInfo(false);}, 
      active: isEditing 
    });

    const saveState = async () => {
      updateExpense(id, personId, {
        money: moneyValue.current ?? null,
        tag: tagValue.current,
        performedAt: performedAt.current,
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


    // make sures extra-info panel is always visible
    usePreventRightOverflow(extraInfoRef, [showExtraInfo]);

    return (
      <div
        onClick={() => {
          if(!readOnlyMode) {
            setIsEditing(true);
            if(!isEditing) setShowExtraInfo(true);
          }
        }}
        ref={(ref) => {elRef.current = ref;}}
        className={`TxTag relative 
        ${readOnlyMode ? "readonly" : ""} ${isDeleted ? "deleted" : ""} ${editMode ? "active": ""} ${showExtraInfo ? "expanded" : ""}`}
      >
        <Tag
          style={{
            border:
              "solid 1px var(" +
              (editMode
                ? "--surface-border-highlighted"
                : "--surface-border") +
              ")",
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
              isReadonly={readOnlyMode || isDeleted}
              onFocus={() => {
                delayDebounceTimer();
              }}
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
              isReadonly={readOnlyMode || isDeleted}
              onFocus={() => {
                delayDebounceTimer();
              }}
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
            {editMode && <>
              <div 
              >
                <span 
                  className={`expand-btn pi ${showExtraInfo ? 'pi-angle-up' : "pi-angle-down"}` }
                  onMouseDown={() => setShowExtraInfo(!showExtraInfo)}
                ></span>
                <span
                  className="remove-btn pi pi-times hover-grow"
                  onMouseDown={deleteTag}
                ></span>
              </div>
            </>}
            {!alwaysShowAsDeleted && showDeleteCheckBox && (
              <Checkbox
                value="deleted"
                className="delete-checkbox"
                checked={showAsDeleted}
                onClick={() => {setTimeout(() => setIsEditing(true));onCheckboxToggle(!showAsDeleted)}}
                style={{ transform: "scale(0.60)", transformOrigin: "center" }}
              />
            )}
            {editMode && showExtraInfo && <>
              <div ref={extraInfoRef} className="extra-info flex flex-column gap-1">
                <div className="mb-2 font-bold">Transaction Info</div>
                <div>
                  <span className="text-color-secondary">Performed at: </span> 
                  <EditableElem
                    initialText={tx.performedAt?.toString() ?? ""}
                    placeHolder="dd"
                    preventNewline={true}
                    numberOnly={true}
                    isReadonly={readOnlyMode || isDeleted}
                    maxNumber={utils.getLastDayOfMonth(monthYear)}
                    className="underline"
                    selectAllOnFocus={true}
                    onKeyUp={(e) => {
                      const target = e.target as HTMLElement;
                      performedAt.current = utils.parseNumber(
                        target.textContent ?? ""
                      );
                      saveState();
                    }}
                  ></EditableElem>-{utils.getShortMonthName(monthYear)}
                </div>
              </div>
            </>}
          </div>
        </Tag>
      </div>
    );
  }
);

export default TxTag;
