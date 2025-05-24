import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useRef } from "react";
import { Navigate } from "react-router-dom";
import useLoginValidation from "../../hooks/useLoginValidation";
import useLogin from "../../hooks/useLogin";
import CenteredForm from "../../components/common/CenteredForm";
import InputField from "../../components/common/InputField";
import PasswordField from "../../components/common/PasswordField";
import CustomLink from "../../components/common/CustomLink";
import { ErrorCodes } from "../../api/constants/ErrorContants";

function LoginPage() {
  const passwordRef = useRef<Password | null>(null);

  const {
    getValues,
    trigger,
    markAllTouched,
    errors,
    touched,
    handleBlur,
    onChange,
  } = useLoginValidation();

  const { email, password } = getValues();
  const { run: performLogin, isLoading, result } = useLogin(getValues);

  if (result?.data) return <Navigate to="/" />;

  const onSubmit = async () => {
    markAllTouched();
    const isValid = await trigger();
    if (isValid) {
      performLogin();
    }
  };

  return (
    <CenteredForm>
      <div className="text-xl text-center">Login</div>
      <br />
      <InputField
        label="Email address"
        id="email"
        type="email"
        defaultValue={email}
        onChange={(e) => onChange("email", e.target.value)}
        onBlur={() => handleBlur("email")}
        onPressEnter={() => passwordRef.current?.focus()}
        errorMsg={errors.email?.message}
        touched={touched.email}
      />
      <PasswordField
        ref={passwordRef}
        label="Password"
        id="password"
        defaultValue={password}
        onChange={(e) => onChange("password", e.target.value)}
        onBlur={() => handleBlur("password")}
        onPressEnter={onSubmit}
        errorMsg={errors.password?.message}
        touched={touched.password}
        showForgotPasswordLink={true}
      />
      <br />
      <br />
      <Button
        label="Submit"
        className="w-full login-btn flex justify-content-center"
        onClick={onSubmit}
        loading={isLoading}
      />
      <br />
      <br />
      <div className="flex justify-content-center">
        <CustomLink to="/sign-up">Don't have an account? Sign up</CustomLink>
      </div>
      <div className="h-5rem"></div>
      {result?.error?.code == ErrorCodes.INVALID_CREDENTIALS && (
        <div className="flex justify-content-center">
          <Message severity="error" text="Invalid email or password" />
        </div>
      )}
    </CenteredForm>
  );
}

export default LoginPage;
