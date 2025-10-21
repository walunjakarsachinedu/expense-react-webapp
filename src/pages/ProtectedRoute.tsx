import { Navigate, Outlet } from "react-router-dom";
import authService from "../core/authService";

function ProtectedRoute() {
  const isExpired = authService.isTokenExpired();

  if (isExpired) authService.clearSessionData();
  return isExpired ? <Navigate to="/login" /> : <Outlet />;
}

export default ProtectedRoute;
