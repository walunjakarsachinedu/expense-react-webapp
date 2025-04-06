import { useEffect } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { monthExpenseRepository } from "../api/repository/MonthExpenseRepository";
import authService from "../core/authService";

function ProtectedRoute() {
  const isExpired = authService.isTokenExpired();

  useEffect(() => {
    if (isExpired) return;
    monthExpenseRepository.loadStoreWithCache();
  }, [isExpired]);

  if (isExpired) authService.clearSessionData();
  return isExpired ? <Navigate to="/login" /> : <Outlet />;
}

export default ProtectedRoute;
