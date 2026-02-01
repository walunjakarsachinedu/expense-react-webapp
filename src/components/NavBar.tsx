import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import moneyIcon from "../images/app-icon.svg";
import useExpenseStore, { timer } from "../store/usePersonStore";
import utils from "../utils/utils";
import MonthPicker from "./MonthPicker";
import "./NavBar.scss";
import authService from "../core/authService";
import OfflineAlert from "./OfflineAlert";
import SyncState from "./SyncState";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";

export default function NavBar() {
  const month = useExpenseStore((store) => store.monthYear);
  const setMonthYear = useExpenseStore((store) => store.setMonthYear);
  const navigate = useNavigate();

  const [isLogoutDialogVisible, setIsLogoutDialogVisible] = useState(false);

  const onMonthChange = (monthYear: string) => {
    setMonthYear(monthYear);
  };

  const logout = () => {
    timer.timeout();
    setIsLogoutDialogVisible(true);
 
  };

  return (
    <div className="nav-bar">
      <Dialog header="Logout" position="top" style={{width: "20rem"}} draggable={false} visible={isLogoutDialogVisible}  onHide={() => {if (!isLogoutDialogVisible) return; setIsLogoutDialogVisible(false); }}>
          <p className="flex justify-content-center flex-column mt-1 m-0">
              <div className="text-color-secondary ">Are you sure you want to logout?</div>
              <div className="flex justify-content-end pt-4 gap-2">
                <Button label="Yes"  className="flex-grow-1" size="small" onClick={() => authService.logout(navigate)} />
                <Button label="No" size="small"  className="flex-grow-1"  style={{backgroundColor: "var(--secondary-interactive)"}} text onClick={() => setIsLogoutDialogVisible(false)} />
              </div>
          </p>
      </Dialog>

      <OfflineAlert></OfflineAlert>
      <div
        className="blur-bg flex justify-content-center align-items-center"
        style={{
          width: "100%",
          padding: 10,
          paddingRight: 15,
          background: "rgba(200,200,200,.02)",
        }}
      >
        <Row className="white-space-nowrap">
          <img
            src={moneyIcon}
            alt="Icon"
            style={{ marginRight: 12, height: "16px" }}
          />
          <b>Expense Tracker</b>
        </Row>

        <div style={{ width: 70 }}></div>
        <SyncState></SyncState>
        <Row>
          <div className="mr-3"></div>
          <MonthPicker
            initialDate={utils.parseDate(month)}
            onDateChange={onMonthChange}
          ></MonthPicker>
          <div className="mr-3"></div>
          <div
            className="border-1 border-round border-200 pi pi-sign-out icon-btn cursor-pointer"
            onClick={logout}
            style={{ fontSize: "0.9rem" }}
          ></div>
        </Row>
      </div>
    </div>
  );
}

type Props = {
  className?: string;
  children: ReactNode;
};

function Row({ className, children }: Props) {
  return (
    <div className={`flex align-items-center ${className}`}>{children}</div>
  );
}
