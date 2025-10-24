import { NavigateFunction } from "react-router-dom";
import utils from "../utils/utils";
import { inMemoryCache } from "../api/cache/InMemoryCacheApi";
import useExpenseStore from "../store/usePersonStore";

class AuthService {
  logout(navigate?: NavigateFunction) {
    this.clearSessionData();
    if (navigate) {
      navigate("/login");
    } else {
      window.location.href = "/login";
    }
  }

  /** Clear data from store, inMemoryCache, localStorage. */
  clearSessionData() {
    useExpenseStore.getState().clear();
    inMemoryCache.clear();
    localStorage.clear();
  }

  isTokenExpired(): boolean {
    const exp = utils.parseNumber(localStorage.getItem("exp")) ?? 0;
    return exp < Date.now();
  }

  storeToken(token: string) {
    localStorage.setItem("token", token);
    const exp = this._getExpTimestamp(token);
    if (exp) localStorage.setItem("exp", `${exp}`);
  }

  private _getExpTimestamp(token: string): number | undefined {
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
}

const authService = new AuthService();

export default authService;
