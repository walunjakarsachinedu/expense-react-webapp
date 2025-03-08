import React from "react";

const infoDialogRef = React.createRef<{
  showDialog: (content: string, onClose: () => void) => void;
}>();

const showInfoDialog = (content: string, onClose: () => void) => {
  infoDialogRef.current?.showDialog(content, onClose);
};

export { infoDialogRef, showInfoDialog };
