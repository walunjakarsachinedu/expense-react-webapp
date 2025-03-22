import { expenseBackendApi } from "../../api/services/ExpenseBackendApi";
import { VerifyResetCodeInput } from "../../models/type";
import usePromise from "../usePromise";

const useVerifyResetCode = ({
  resetCode,
  email,
  nonce,
}: VerifyResetCodeInput) =>
  usePromise({
    asyncFn: () =>
      expenseBackendApi.verifyResetCode({ resetCode, email, nonce }),
    manual: true,
  });

export default useVerifyResetCode;
