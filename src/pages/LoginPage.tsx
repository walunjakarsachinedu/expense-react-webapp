import { Button } from "primereact/button";
import { Message } from "primereact/message";
import { useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import CustomLink from "../components/common/CustomLink";
import InputField from "../components/common/InputField";
import useLogin from "../hooks/useLogin";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const passwordRef = useRef<HTMLInputElement | null>(null);
  const {
    run: performLogin,
    isLoading,
    result: token,
  } = useLogin(email, password);

  if (token?.data) return <Navigate to="/"></Navigate>;

  return (
    <div className="flex flex-column align-items-center justify-content-center mt-8">
      <div className="w-20rem">
        <div className="text-xl text-center">Login</div>
        <br />
        <InputField
          label="Email address"
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onPressEnter={() => passwordRef.current?.focus()}
        ></InputField>
        <InputField
          ref={passwordRef}
          label="Password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onPressEnter={performLogin}
        ></InputField>
        <br />
        <br />
        <Button
          label="Submit"
          className="w-full login-btn flex justify-content-center"
          onClick={performLogin}
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
