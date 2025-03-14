import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useRef } from "react";
import { Navigate } from "react-router-dom";
import CustomLink from "../components/common/CustomLink";
import InputField from "../components/common/InputField";
import PasswordField from "../components/common/PasswordField";
import useLogin from "../hooks/useLogin";
import useLoginValidation from "../hooks/useLoginValidation";

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
  const {
    run: performLogin,
    isLoading,
    result: token,
  } = useLogin(email, password);

  if (token?.data) return <Navigate to="/" />;

  const onSubmit = async () => {
    markAllTouched();
    const isValid = await trigger();
    if (isValid) {
      performLogin();
    }
  };

  return (
    <div className="flex flex-column align-items-center justify-content-center mt-8">
      <div className="w-20rem">
        <div className="text-xl text-center">Login</div>
        <br />
        <InputField
          label="Email address"
          id="email"
          type="email"
          defaulValue={email}
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
        {token?.error && (
          <div className="flex justify-content-center">
            <Message severity="error" text="Invalid email or password" />
          </div>
        )}
      </div>
    </div>
  );
}

export default LoginPage;
