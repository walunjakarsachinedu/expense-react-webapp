import { ExpenseBackendApi } from "../api/services/ExpenseBackendApi";
import authService from "../core/authService";
import usePromise from "./usePromise";

const useSignup = (name: string, email: string, password: string) =>
  usePromise({
    asyncFn: () => performSignup(name, email, password),
    manual: true,
  });

const performSignup = async (name: string, email: string, password: string) => {
  const token = await ExpenseBackendApi.provider.performSignup(
    name,
    email,
    password
  );

  if (token.data) {
    authService.storeToken(token.data);
  }
  return token;
};

export default useSignup;
