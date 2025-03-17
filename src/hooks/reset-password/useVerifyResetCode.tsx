import { ExpenseBackendApi } from "../../api/ExpenseBackendApi";
import { VerifyResetCodeInput } from "../../models/type";
import usePromise from "../usePromise";

const useVerifyResetCode = ({
  resetCode,
  email,
  nonce,
}: VerifyResetCodeInput) =>
  usePromise({
    asyncFn: () =>
      ExpenseBackendApi.provider.verifyResetCode({ resetCode, email, nonce }),
    manual: true,
  });

export default useVerifyResetCode;
