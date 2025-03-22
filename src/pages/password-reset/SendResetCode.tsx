import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Navigate } from "react-router-dom";
import { ErrorCodes } from "../../api/constants/ErrorContants";
import CenteredForm from "../../components/common/CenteredForm";
import CustomLink from "../../components/common/CustomLink";
import InputField from "../../components/common/InputField";
import { useNonce } from "../../hooks/reset-password/useNonce";
import useSendResetCode from "../../hooks/reset-password/useSendResetCode";
import { useFormValidation } from "../../hooks/useFormValidation";
import { sendResetCodeSchema } from "../../utils/form-validation-schema";

function SendResetCode() {
  const { getValues, setupFieldValidation, validateForm } = useFormValidation({
    resolver: yupResolver(sendResetCodeSchema),
    defaultValues: { email: "" },
  });

  const nonce = useNonce(true);
  const { email } = getValues();

  const {
    isLoading,
    run: sendResetCode,
    result,
  } = useSendResetCode(email, nonce);

  const onSubmit = async () => {
    const isValid = await validateForm();
    if (isValid) sendResetCode();
  };

  if (result?.data) {
    sessionStorage.setItem("email", email);
    return <Navigate to="/forgot-password/verify" />;
  }

  return (
    <CenteredForm>
      <div className="text-xl text-center">Forgot Password?</div>
      <br />
      <InputField
        label="Email address"
        id="email"
        type="email"
        {...setupFieldValidation("email")}
      ></InputField>
      <br />
      <br />
      <Button
        label="Reset password"
        className="w-full login-btn flex justify-content-center"
        onClick={onSubmit}
        loading={isLoading}
      />
      <br />
      <br />
      <div className="flex justify-content-center">
        <CustomLink to="/login">← Back to log in</CustomLink>
      </div>
      <div className="h-5rem"></div>
      {result?.error?.code == ErrorCodes.USER_NOT_FOUND && (
        <div className="flex justify-content-center">
          <Message severity="error" text="User with given email not found" />
        </div>
      )}
      {result?.error?.code == ErrorCodes.ERROR_IN_SENDING_EMAIL && (
        <div className="flex justify-content-center">
          <Message
            severity="error"
            text="Some error occured in sending reset code. Try after sometime"
          />
        </div>
      )}
    </CenteredForm>
  );
}

export default SendResetCode;
