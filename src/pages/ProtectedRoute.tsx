import { useLocalStorage } from "primereact/hooks";
import { Navigate, Outlet } from "react-router-dom";

function ProtectedRoute() {
  const [isLogin] = useLocalStorage(false, "token");
  return isLogin ? <Outlet /> : <Navigate to="/login" />;
}

export default ProtectedRoute;
