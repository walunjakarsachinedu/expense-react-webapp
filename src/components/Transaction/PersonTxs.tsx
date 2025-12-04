import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { MenuItem } from "primereact/menuitem";
import { memo, useState } from "react";
import useToast from "../../hooks/useToast";
import { ConflictPerson } from "../../models/type";
import useExpenseStore from "../../store/usePersonStore";
import utils from "../../utils/utils";
import EditableElem from "../common/EditableElement";
import ContextMenuButton from "../ContextMenuButton";
import "./PersonTxs.scss";
import TxTag from "./TxTag";
import personUtils from "../../utils/personUtils";
import { AutoCollapse } from "../AutoCollapse";

type Props = {
  id: string;
  /** Always true if showAsDeleted internal state is true */
  makeReadOnly?: boolean;
  conflictMode?: boolean;
};

const PersonTxs = memo(
  ({ id, makeReadOnly = false, conflictMode = false }: Props) => {
    const toast = useToast();
    const addExpense = useExpenseStore((store) => store.addExpense);
    const deletePerson = useExpenseStore((store) => store.deletePerson);
    const copyPerson = useExpenseStore((store) => store.copyPerson);

    const filter = useExpenseStore((store) => store.filter);
    const txIds = useExpenseStore((store) => store.persons[id].txIds)
      .filter(txId => personUtils.isTxSatisfyFilter(txId, filter));
    const conflicts = useExpenseStore((store) => store.conflicts);
    const conflict = conflicts?.find((conflict) => conflict._id == id);

    const [showAsDeleted, setShowAsDeleted] = useState(
      conflict?.toDelete ?? false
    );

    const [isExpanded, setIsExpanded] = useState<boolean>(true);

    const showDeleteCheckBox = conflictMode && conflict?.isDeleted;

    if (showDeleteCheckBox || showAsDeleted || conflictMode) {
      makeReadOnly = true;
    }

    const actionItems: MenuItem[] = [
      {
        icon: "pi pi-clipboard",
        label: "copy",
        command: () => copyPerson(id),
      },
      {
        icon: "pi pi-trash",
        label: "delete",
        command: () => {
          showDeletionToast();
          setTimeout(() => {
            deletePerson(id);
          });
        },
      },
    ];

    const showDeletionToast = () => {
      toast.current?.show({
        severity: "success",
        summary: "Success",
        detail: "Person Deleted Successfully",
        life: 2000,
      });
    };

    const txList = txIds.length > 0 && (
      <>
        <br />
        <div className="flex align-items-center flex-wrap gap-2 mt-2">
          {txIds
            .slice()
            .reverse()
            .map((txId, i) => (
              <TxTag
                key={txId}
                id={txId}
                personId={id}
                alwaysShowAsDeleted={showAsDeleted}
                conflictMode={conflictMode}
              />
            ))}
        </div>
      </>
    );

    const addTxTagButton = (
      <div
        className="ml-3 pi pi-plus icon-btn add-btn border-primary font-semibold"
        onClick={() => {
          addExpense(id);
          setIsExpanded(true);
        }}
      ></div>
    );

    const onCheckboxToggle = (isChecked: boolean) => {
      setShowAsDeleted(isChecked);
      if (!conflict) return;

      useExpenseStore.setState({
        conflicts: conflicts?.map<ConflictPerson>((el) =>
          el._id == conflict._id ? { ...conflict, toDelete: isChecked } : el
        ),
      });
    };

    return (
      <div className="PersonTxsComp">
        <div className="flex justify-content-between align-items-center">
          <div className="mr-2 flex align-items-center">
            {conflictMode && !showDeleteCheckBox && <div className="w-2rem" />}
            {conflictMode && showDeleteCheckBox && (
              <Checkbox
                value="deleted"
                checked={showAsDeleted}
                onClick={() => onCheckboxToggle(!showAsDeleted)}
                className="mr-2"
                style={{ transform: "scale(0.70)", transformOrigin: "center" }}
              />
            )}
            {!conflictMode && 
              <i className="pi pi-angle-down mr-2 cursor-pointer"
                style={{ transform: isExpanded ? "rotate(0deg)" : "rotate(-90deg)" }}
                onClick={() => setIsExpanded(prev => !prev)}
              ></i>
            }
            <PersonName
              id={id}
              makeReadOnly={makeReadOnly}
              showAsDeleted={showAsDeleted}
            />
            {!makeReadOnly && !showAsDeleted && addTxTagButton}
            {!conflictMode && <ContextMenuButton items={actionItems} className="ml-3" />}
          </div>
          <div className="flex align-items-center">
            <PersonTotal id={id} />
          </div>
        </div>
        <AutoCollapse isOpen={isExpanded}>{txList}</AutoCollapse> 
        <Divider className="mt-4"></Divider>
      </div>
    );
  }
);

const PersonName = ({
  id,
  showAsDeleted = false,
  makeReadOnly = false,
}: Props & { showAsDeleted?: boolean }) => {
  if (showAsDeleted) makeReadOnly = true;
  const name = useExpenseStore((store) => store.persons[id].name);
  const updateName = useExpenseStore((store) => store.updateName);
  const delayDebounceTimer = useExpenseStore(
    (store) => store.delayDebounceTimer
  );
  return (
    <div
      className={`
        ${showAsDeleted ? "deleted" : ""}`}
    >
      <EditableElem
        initialText={name}
        preventNewline={true}
        trimInput={true}
        maxCharacter={17}
        className="name text-500"
        isReadonly={makeReadOnly || showAsDeleted}
        placeHolder="Person name"
        onFocus={() => delayDebounceTimer()}
        onChange={(value) => updateName(id, value)}
      />
    </div>
  );
};

const PersonTotal = ({ id }: Props) => {
  const filter = useExpenseStore(store => store.filter);
  const person = useExpenseStore((store) => store.persons[id]);
  const total = Object.values(person.txs)
    .filter(tx => personUtils.isTxSatisfyFilter(tx._id, filter))
    .reduce((total, tx) => total + (tx.money ?? 0), 0);
  if (Object.keys(person.txs).length == 0 || total == 0) return null;
  return (
    <>
      {utils.formatNumber(total)} <span className="pl-1 text-500"> /-</span>
    </>
  );
};

export default PersonTxs;
