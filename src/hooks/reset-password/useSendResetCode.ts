import { expenseBackendApi } from "../../api/services/ExpenseBackendApi";
import usePromise from "../usePromise";

const useSendResetCode = (email: string, nonce: string) =>
  usePromise({
    asyncFn: () => expenseBackendApi.sendResetCode(email, nonce),
    manual: true,
  });

export default useSendResetCode;
