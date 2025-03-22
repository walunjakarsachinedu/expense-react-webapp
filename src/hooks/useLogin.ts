import { expenseBackendApi } from "../api/services/ExpenseBackendApi";
import authService from "../core/authService";
import usePromise from "./usePromise";

const useLogin = (email: string, password: string) =>
  usePromise({
    asyncFn: () => performLogin(email, password),
    manual: true,
  });

const performLogin = async (email: string, password: string) => {
  const token = await expenseBackendApi.performLogin(email, password);

  if (token.data) {
    authService.storeToken(token.data);
  }
  return token;
};

export default useLogin;
