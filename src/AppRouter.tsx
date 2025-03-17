import { Route, Routes } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import PageNotFound from "./pages/PageNotFound";
import ProtectedRoute from "./pages/ProtectedRoute";
import Layout from "./pages/Layout";
import SignupPage from "./pages/SignupPage";
import SendResetCode from "./pages/password-reset/SendResetCode";
import VerifyResetCode from "./pages/password-reset/VerifyResetCode";
import ChangePassword from "./pages/password-reset/ChangePassword";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/sign-up" element={<SignupPage />} />
      <Route path="/forgot-password">
        <Route index element={<SendResetCode />}></Route>
        <Route path="verify" element={<VerifyResetCode />}></Route>
        <Route path="reset" element={<ChangePassword />}></Route>
      </Route>
      <Route path="/" element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route index element={<HomePage />} />
        </Route>
      </Route>
      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
}
