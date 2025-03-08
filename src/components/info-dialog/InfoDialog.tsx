import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { useImperativeHandle, useRef, useState } from "react";
import { infoDialogRef } from "./infoDialogRef";
import "./InfoDialog.css";

/** simple dialog, which expose its functionality to `dialogRef`. */
const InfoDialog = () => {
  const [isDialogVisible, setDialogVisible] = useState(false);
  const [content, setContent] = useState("");
  const onCloseRef = useRef<() => void>();

  const showDialog = (content: string, onClose: () => void) => {
    setContent(content);
    setDialogVisible(true);
    onCloseRef.current = onClose;
  };

  const hideDialog = () => {
    if (!isDialogVisible) return;
    setDialogVisible(false);
    onCloseRef.current?.();
  };

  useImperativeHandle(infoDialogRef, () => ({
    showDialog,
  }));

  return (
    <div>
      <Dialog
        position="top"
        showHeader={false}
        closable={false}
        className="custom-info-dialog"
        visible={isDialogVisible}
        onHide={() => {}}
      >
        <p className="mt-4 m-0">{content}</p>
        <div className="mt-4 flex justify-content-end">
          <Button size="small" onClick={hideDialog}>
            Ok
          </Button>
        </div>
      </Dialog>
    </div>
  );
};

export default InfoDialog;
