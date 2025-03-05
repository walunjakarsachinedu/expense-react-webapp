import { ExpenseBackendApi } from "../api/ExpenseBackendApi";
import usePromise from "./usePromise";

const useLogin = (email: string, password: string) =>
  usePromise({
    asyncFn: () => performLogin(email, password),
    manual: true,
  });

const performLogin = async (email: string, password: string) => {
  const token = await ExpenseBackendApi.provider.performLogin(email, password);

  if (token.data) {
    localStorage.setItem("token", token.data);
    const exp = _getExpTimestamp(token.data);
    if (exp) localStorage.setItem("exp", `${exp}`);
  }
  return token;
};

function _getExpTimestamp(token: string): number | undefined {
  const [, payloadBase64] = token.split(".");
  if (!payloadBase64) return undefined;

  try {
    const payloadJson = atob(payloadBase64);
    const payload: unknown = JSON.parse(payloadJson);

    if (typeof payload === "object" && payload !== null && "exp" in payload) {
      return (payload as { exp: number }).exp * 1000;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export default useLogin;
