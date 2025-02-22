import { ExpenseBackendApi } from "../api/ExpenseBackendApi";
import usePromise from "./usePromise";

const performLogin = async (email: string, password: string) => {
  const token = await ExpenseBackendApi.provider.performLogin(email, password);

  if (token.data) {
    localStorage.setItem("token", token.data);
  }
  return token;
};

const useLogin = (email: string, password: string) =>
  usePromise({
    asyncFn: () => performLogin(email, password),
    manual: true,
  });

export default useLogin;
