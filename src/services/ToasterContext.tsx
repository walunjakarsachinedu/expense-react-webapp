import { Toast } from "primereact/toast";
import { createContext, ReactNode, RefObject, useRef } from "react";

type ToasterContext = RefObject<Toast>;

const ToastContext = createContext<ToasterContext>({} as RefObject<Toast>);

type Props = {
  children: ReactNode;
};

export const ToastProvider = ({ children }: Props) => {
  const toastRef = useRef(null);

  return (
    <ToastContext.Provider value={toastRef}>
      <Toast ref={toastRef} position="bottom-right" />
      {children}
    </ToastContext.Provider>
  );
};

export { ToastContext };
