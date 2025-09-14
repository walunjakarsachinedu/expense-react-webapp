import { Toast } from "primereact/toast";
import { createContext, ReactNode, RefObject, useRef } from "react";

type ToasterContext = RefObject<Toast | null>;

const ToastContext = createContext<ToasterContext>({} as RefObject<Toast | null>);

type Props = {
  children: ReactNode;
};

const ToastProvider = ({ children }: Props) => {
  const toastRef = useRef(null);

  return (
    <ToastContext.Provider value={toastRef}>
      <Toast ref={toastRef} position="bottom-right" />
      {children}
    </ToastContext.Provider>
  );
};

export { ToastProvider, ToastContext };
