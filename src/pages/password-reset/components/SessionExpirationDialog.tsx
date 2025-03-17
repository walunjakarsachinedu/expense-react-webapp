import { useNonce } from "../../../hooks/reset-password/useNonce";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import { Navigate, useNavigate } from "react-router-dom";
import useSendResetCode from "../../../hooks/reset-password/useSendResetCode";

type Props = {
  showLoginButton?: boolean;
};
function SessionExpirationDialog({ showLoginButton = true }: Props) {
  const navigate = useNavigate();
  const email = sessionStorage.getItem("email")!;
  const nonce = useNonce(true);

  const {
    isLoading,
    run: sendResetCode,
    result,
  } = useSendResetCode(email, nonce);

  if (result?.data) return <Navigate to="/forgot-password/verify" />;

  return (
    <Dialog
      header="Session Expired"
      visible={true}
      onHide={() => {}}
      closable={false}
      dismissableMask={false}
      position="top"
      modal
      draggable={false}
    >
      <p className="m-0 line-height-3">
        Your session has expired. <br />
        {showLoginButton
          ? "Please log in again or resend the reset code to continue."
          : "Click 'Resend Code' to send the code to your email again."}
      </p>
      <div className="flex justify-content-end gap-3 mt-5">
        {showLoginButton && (
          <Button label="Login" onClick={() => navigate("/login")} />
        )}
        <Button
          loading={isLoading}
          label="Resend Code"
          onClick={() => sendResetCode()}
        />
      </div>
    </Dialog>
  );
}

export default SessionExpirationDialog;
