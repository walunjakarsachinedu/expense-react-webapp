import { NavigateFunction } from "react-router-dom";
import utils from "../utils/utils";

class AuthService {
  logout(navigate?: NavigateFunction) {
    this.clearSessionData();
    if (navigate) {
      navigate("/login");
    } else {
      window.location.href = "/login";
    }
  }

  clearSessionData() {
    localStorage.clear();
  }

  isTokenExpired(): boolean {
    const exp = utils.parseNumber(localStorage.getItem("exp")) ?? 0;
    return exp < Date.now();
  }
}

const authService = new AuthService();

export default authService;
