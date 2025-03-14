import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { Password } from "primereact/password";
import { useRef } from "react";
import { Navigate } from "react-router-dom";
import CustomLink from "../components/common/CustomLink";
import InputField from "../components/common/InputField";
import PasswordField from "../components/common/PasswordField";
import useSignup from "../hooks/useSignup";
import useSignupValidation from "../hooks/useSignupValidation";

function SignupPage() {
  const emailRef = useRef<HTMLInputElement | null>(null);
  const passwordRef = useRef<Password | null>(null);
  const confirmPasswordRef = useRef<Password | null>(null);
  const {
    getValues,
    trigger,
    errors,
    touched,
    handleBlur,
    onChange,
    markAllTouched,
  } = useSignupValidation();
  const { name, email, password, confirmPassword } = getValues();
  const {
    run: performSignup,
    isLoading,
    result: token,
  } = useSignup(name, email, password);

  if (token?.data) return <Navigate to="/"></Navigate>;

  const onSubmit = async () => {
    markAllTouched();
    const isValid = await trigger();

    if (isValid) {
      performSignup();
    }
  };

  return (
    <div className="flex flex-column align-items-center justify-content-center mt-8">
      <div className="w-20rem">
        <div className="text-xl text-center">Sign Up</div>
        <br />
        <InputField
          label="Name"
          id="name"
          type="name"
          value={name}
          onChange={(e) => onChange("name", e.target.value)}
          onBlur={() => handleBlur("name")}
          onPressEnter={() => emailRef.current?.focus()}
          errorMsg={errors.name?.message}
          touched={touched.name}
        ></InputField>
        <InputField
          ref={emailRef}
          label="Email address"
          id="email"
          type="email"
          value={email}
          onChange={(e) => onChange("email", e.target.value)}
          onBlur={() => handleBlur("email")}
          onPressEnter={() => passwordRef.current?.focus()}
          errorMsg={errors.email?.message}
          touched={touched.email}
        ></InputField>
        <PasswordField
          ref={passwordRef}
          label="Password"
          id="password"
          value={password}
          onChange={(e) => onChange("password", e.target.value)}
          onBlur={() => handleBlur("password")}
          onPressEnter={() => confirmPasswordRef.current?.focus()}
          errorMsg={errors.password?.message}
          touched={touched.password}
        />
        <PasswordField
          ref={confirmPasswordRef}
          label="Confirm Password"
          id="confirm-password"
          value={confirmPassword}
          onChange={(e) => onChange("confirmPassword", e.target.value)}
          onBlur={() => handleBlur("confirmPassword")}
          errorMsg={errors.confirmPassword?.message}
          touched={touched.confirmPassword}
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
          <CustomLink to="/login">Have an account? Log in</CustomLink>
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

export default SignupPage;
