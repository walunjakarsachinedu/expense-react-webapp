import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Navigate } from "react-router-dom";
import { ErrorCodes } from "../../api/ErrorContants";
import CenteredForm from "../../components/common/CenteredForm";
import InputField from "../../components/common/InputField";
import { useNonce } from "../../hooks/reset-password/useNonce";
import useVerifyResetCode from "../../hooks/reset-password/useVerifyResetCode";
import { useFormValidation } from "../../hooks/useFormValidation";
import { verifyResetCodeSchema } from "../../utils/form-validation-schema";
import CountdownTimer from "./components/CountdownTimer";
import { useState } from "react";
import SessionExpirationDialog from "./components/SessionExpirationDialog";

function VerifyResetCode() {
  const [isSessionExpired, setIsSessionExpired] = useState(false);
  const { getValues, setupFieldValidation, validateForm } = useFormValidation({
    resolver: yupResolver(verifyResetCodeSchema),
  });

  const nonce = useNonce();
  const { resetCode } = getValues();
  const email = sessionStorage.getItem("email")!;

  const {
    isLoading,
    run: sendResetCode,
    error,
    result,
  } = useVerifyResetCode({ resetCode, email, nonce });

  const onSubmit = async () => {
    const isValid = await validateForm();
    if (isValid) sendResetCode();
  };

  if (!nonce || !email) return <Navigate to="/forgot-password" />;

  if (result?.data) {
    sessionStorage.setItem("resetCode", result!.data);
    return <Navigate to="/forgot-password/reset" />;
  }

  return (
    <CenteredForm>
      {isSessionExpired && <SessionExpirationDialog showLoginButton={false} />}
      <div className="text-xl text-center">Verify Reset Code</div>
      <br />
      <InputField
        label="Reset code"
        id="reset-code"
        {...setupFieldValidation("resetCode")}
      ></InputField>
      <br />
      <br />
      <Button
        label="Verify code"
        className="w-full login-btn flex justify-content-center"
        onClick={onSubmit}
        loading={isLoading}
      />

      {!isSessionExpired && (
        <div className="mt-5 text-center text-300 ">
          <div className="mb-3">
            Code will expires in &nbsp;
            {
              <CountdownTimer
                startSeconds={10 * 60}
                onExpire={() => {
                  setIsSessionExpired(true);
                }}
              ></CountdownTimer>
            }
          </div>
          <div>Enter before reset code expires</div>
        </div>
      )}
      <div className="h-5rem"></div>
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

export default VerifyResetCode;
