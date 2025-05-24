import { UseFormGetValues } from "react-hook-form";
import { expenseBackendApi } from "../api/services/ExpenseBackendApi";
import authService from "../core/authService";
import usePromise from "./usePromise";

const useLogin = (valueGetter: LoginValueGetter) =>
  usePromise({
    asyncFn: () => performLogin(valueGetter),
    manual: true,
  });

const performLogin = async (valueGetter: LoginValueGetter) => {
  const { email, password } = valueGetter();
  const token = await expenseBackendApi.performLogin(email, password);

  if (token.data) {
    authService.storeToken(token.data);
  }
  return token;
};

type LoginValueGetter = UseFormGetValues<{
  email: string;
  password: string;
}>;

export default useLogin;
