import { useContext } from "react";
import { ToastContext } from "../services/ToasterContext";

const useToast = () => {
  return useContext(ToastContext);
};

export default useToast;
