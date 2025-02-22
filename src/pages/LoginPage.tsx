import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Message } from "primereact/message";
import { useState } from "react";
import { Navigate } from "react-router-dom";
import useLogin from "../hooks/useLogin";
import "./LoginPage.css";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
        <br />
        <div className="flex flex-column gap-2 w-full">
          <label htmlFor="email">Email address</label>
          <InputText
            id="email"
            type="email"
            className="w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <br />
        <div className="flex flex-column gap-2 w-full">
          <label htmlFor="password">Password</label>
          <InputText
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <br />
        <br />
        <Button
          label="Submit"
          className="w-full login-btn flex justify-content-center"
          onClick={performLogin}
          loading={isLoading}
        />
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
