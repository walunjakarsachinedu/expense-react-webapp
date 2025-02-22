import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { useState } from "react";

function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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
        <Button label="Submit" className="w-full" />
      </div>
    </div>
  );
}

export default LoginPage;
