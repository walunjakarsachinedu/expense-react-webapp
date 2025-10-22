import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { monthExpenseRepository } from "../api/repository/MonthExpenseRepository";
import { TxType } from "../models/type";
import useExpenseStore from "../store/usePersonStore";
import "./ConflictResolutionDialog.scss";
import ConflictResolutionPanel from "./Transaction/ConflictResolutionPanel";

function ConflictResolutionDialog() {
  const isConflictsFound = useExpenseStore((store) => store.isConflictsFound);
  const conflicts = useExpenseStore((store) => store.conflicts);

  const persons = useExpenseStore((store) => store.persons);

  const isConflictsFoundInExpense =
    conflicts?.some(
      (conflict) => persons[conflict._id]?.type == TxType.Expense
    ) ?? false;
  const isConflictsFoundInIncome =
    conflicts?.some(
      (conflict) => persons[conflict._id]?.type == TxType.Income
    ) ?? false;

  const saveAndCloseDialog = () => {
    monthExpenseRepository.processConflicts();
    useExpenseStore.getState().clearConflicts();
  };

  const headerElement = (
    <div className="inline-flex align-items-center justify-content-between gap-2 w-full">
      <span className="font-bold white-space-nowrap">Conflict Resolution</span>
      <div>
        <Button label="Save" size="small" onClick={saveAndCloseDialog}></Button>
      </div>
    </div>
  );

  return (
    <Dialog
      header={headerElement}
      visible={isConflictsFound}
      onHide={() => {}}
      closable={false}
      className="col-12 md:col-10 p-0 ConflictResolutionDialog"
      dismissableMask={false}
      maskClassName="blurred-overlay"
      blockScroll={true}
      position="top"
      modal
      draggable={false}
    >
      <div className="text-400 px-4">
        Some changes couldn't be applied because the items were deleted on the
        server. Please review and select items to delete;&nbsp;
        <b>unselected items will be saved.</b>
      </div>
      {isConflictsFoundInExpense && (
        <>
          <br />
          <br />
          <ConflictResolutionPanel type={TxType.Expense} />
        </>
      )}
      {isConflictsFoundInIncome && (
        <>
          <br />
          <br />
          <ConflictResolutionPanel type={TxType.Income} />
        </>
      )}
    </Dialog>
  );
}

export default ConflictResolutionDialog;
