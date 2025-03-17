import { ExpenseBackendApi } from "../../api/ExpenseBackendApi";
import usePromise from "../usePromise";

const useSendResetCode = (email: string, nonce: string) =>
  usePromise({
    asyncFn: () => ExpenseBackendApi.provider.sendResetCode(email, nonce),
    manual: true,
  });

export default useSendResetCode;
