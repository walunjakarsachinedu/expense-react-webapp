import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "primereact/button";
import { Dialog } from "primereact/dialog";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useRef, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { ErrorCodes } from "../../api/constants/ErrorContants";
import CenteredForm from "../../components/common/CenteredForm";
import PasswordField from "../../components/common/PasswordField";
import useChangePassword from "../../hooks/reset-password/useChangePassword";
import { useNonce } from "../../hooks/reset-password/useNonce";
import { useFormValidation } from "../../hooks/useFormValidation";
import { changePasswordSchema } from "../../utils/form-validation-schema";
import CountdownTimer from "./components/CountdownTimer";
import SessionExpirationDialog from "./components/SessionExpirationDialog";

function ChangePassword() {
  const [sessionExpired, setSessionExpired] = useState(false);
  const navigate = useNavigate();
  const confirmPasswordRef = useRef<Password | null>(null);
  const { getValues, setupFieldValidation, validateForm } = useFormValidation({
    resolver: yupResolver(changePasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const resetCode = sessionStorage.getItem("resetCode")!;
  const email = sessionStorage.getItem("email")!;
  const nonce = useNonce();
  const { password } = getValues();

  const {
    isLoading,
    run: changePassword,
    result,
  } = useChangePassword({ resetCode, email, nonce, newPassword: password });

  const onSubmit = async () => {
    const isValid = await validateForm();
    if (isValid) {
      changePassword();
    }
  };

  if (!email || !nonce || !resetCode) return <Navigate to="/forgot-password" />;
  if (result?.data) return <Navigate to="/" />;

  const isSessionExpired =
    sessionExpired || result?.error?.message == ErrorCodes.INVALID_RESET_CODE;

  return (
    <CenteredForm>
      {isSessionExpired && <SessionExpirationDialog />}
      <div className="text-xl text-center">Change Password</div>
      <br />
      <PasswordField
        label="Password"
        id="password"
        onPressEnter={() => confirmPasswordRef.current?.focus()}
        {...setupFieldValidation("password")}
      />
      <PasswordField
        ref={confirmPasswordRef}
        label="Confirm Password"
        id="confirmPassword"
        {...setupFieldValidation("confirmPassword")}
      />
      <br />
      <br />
      <Button
        label="Reset password"
        className="w-full login-btn flex justify-content-center"
        onClick={onSubmit}
        loading={isLoading}
      />
      {!isSessionExpired && (
        <div className="mt-5 text-center text-300 ">
          <div className="mb-2">
            Session will expires in &nbsp;
            {
              <CountdownTimer
                startSeconds={10 * 60}
                onExpire={() => {
                  setSessionExpired(true);
                }}
              ></CountdownTimer>
            }
          </div>
          <div>Set password before session expires</div>
        </div>
      )}
      <br />
      <br />
      <br />
      {result?.error?.message == ErrorCodes.INVALID_RESET_CODE && (
        <div className="flex justify-content-center">
          <Message severity="error" text="Invalid or expired reset code." />
        </div>
      )}
      {result?.error?.message == ErrorCodes.INVALID_RESET_DATA && (
        <div className="flex justify-content-center">
          <Message
            severity="error"
            text="Invalid data found, please try again."
          />
        </div>
      )}
    </CenteredForm>
  );
}

export default ChangePassword;
