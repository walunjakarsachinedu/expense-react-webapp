import { Divider } from "primereact/divider";
import { MenuItem } from "primereact/menuitem";
import { memo, useState } from "react";
import useToast from "../../hooks/useToast";
import useExpenseStore from "../../store/usePersonStore";
import EditableElem from "../common/EditableElement";
import ContextMenuButton from "../ContextMenuButton";
import "./PersonTxs.css";
import TxTag from "./TxTag";
import utils from "../../utils/utils";
import { Checkbox } from "primereact/checkbox";

type Props = {
  id: string;
  /** Always true if showAsDeleted internal state is true */
  makeReadOnly?: boolean;
  showDeleteCheckBox?: boolean;
};

const PersonTxs = memo(
  ({ id, makeReadOnly = false, showDeleteCheckBox = false }: Props) => {
    const [showAsDeleted, setShowAsDeleted] = useState(false);
    if (showDeleteCheckBox || showAsDeleted) makeReadOnly = true;
    const toast = useToast();
    const addExpense = useExpenseStore((store) => store.addExpense);
    const deletePerson = useExpenseStore((store) => store.deletePerson);
    const copyPerson = useExpenseStore((store) => store.copyPerson);
    const txIds = useExpenseStore((store) => store.persons[id].txIds);

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

    const txList =
      txIds.length > 0 ? (
        <>
          <br />
          <div className="flex align-items-center flex-wrap gap-2">
            {txIds
              .slice()
              .reverse()
              .map((txId, i) => (
                <TxTag
                  key={txId}
                  id={txId}
                  personId={id}
                  alwaysShowAsDeleted={showAsDeleted}
                  makeReadOnly={makeReadOnly}
                  showDeleteCheckBox={false}
                />
              ))}
          </div>
          <br />
        </>
      ) : (
        <br />
      );

    const addTxTagButton = (
      <div
        className="ml-3 pi pi-plus icon-btn add-btn border-primary font-semibold"
        onClick={() => {
          addExpense(id);
        }}
      ></div>
    );

    return (
      <div className="PersonTxsComp">
        <div className="flex justify-content-between align-items-center">
          <div className="mr-2 flex align-items-center">
            {showDeleteCheckBox ? (
              <Checkbox
                value="deleted"
                checked={showAsDeleted}
                onClick={() => setShowAsDeleted(!showAsDeleted)}
                className="mr-2"
                style={{ transform: "scale(0.70)", transformOrigin: "center" }}
              />
            ) : (
              <ContextMenuButton items={actionItems} />
            )}
            <PersonName
              id={id}
              makeReadOnly={makeReadOnly}
              showAsDeleted={showAsDeleted}
            />
            {!makeReadOnly && !showAsDeleted && addTxTagButton}
          </div>
          <div className="flex align-items-center">
            <PersonTotal id={id} />
          </div>
        </div>
        {txList}
        <Divider className="mt-2"></Divider>
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
  const person = useExpenseStore((store) => store.persons[id]);
  const total = Object.values(person.txs).reduce(
    (total, tx) => total + (tx.money ?? 0),
    0
  );
  if (Object.keys(person.txs).length == 0 || total == 0) return null;
  return (
    <>
      {utils.formatNumber(total)} <span className="pl-1 text-500"> /-</span>
    </>
  );
};

export default PersonTxs;
