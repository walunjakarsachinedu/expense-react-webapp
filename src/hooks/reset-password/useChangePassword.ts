import { expenseBackendApi } from "../../api/services/ExpenseBackendApi";
import authService from "../../core/authService";
import { ChangePasswordInput } from "../../models/type";
import usePromise from "../usePromise";

const useChangePassword = (args: ChangePasswordInput) =>
  usePromise({
    asyncFn: () => changePassword(args),
    manual: true,
  });

const changePassword = async ({
  resetCode,
  email,
  nonce,
  newPassword,
}: ChangePasswordInput) => {
  const token = await expenseBackendApi.changePassword({
    resetCode,
    email,
    nonce,
    newPassword,
  });

  if (token.data) {
    authService.storeToken(token.data);
  }
  return token;
};

export default useChangePassword;
