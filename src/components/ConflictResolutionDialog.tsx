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

  const txTypes = Object.values(TxType) as TxType[];
  const conflictsByType = txTypes.filter((type) =>
    conflicts?.some(
      (conflict) => persons[conflict._id]?.type === type
    )
  );

  const saveAndCloseDialog = () => {
    monthExpenseRepository.processConflicts();
    useExpenseStore.getState().clearConflicts();
  };

  const headerElement = (
    <div className="inline-flex align-items-center justify-content-between gap-2 w-full">
      <span className="font-bold white-space-nowrap">Conflict Resolution</span>
      <div>
        <Button label="Save" size="small" onClick={saveAndCloseDialog} />
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
      blockScroll
      position="top"
      modal
      draggable={false}
    >
      <div className="text-400 px-4">
        Some changes couldn't be applied because the items were deleted on the
        server. Please review and select items to delete;&nbsp;
        <b>unselected items will be saved.</b>
      </div>

      {conflictsByType.map((type) => (
        <div key={type}>
          <br />
          <br />
          <ConflictResolutionPanel type={type} />
        </div>
      ))}
    </Dialog>
  );
}

export default ConflictResolutionDialog;
