import { ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import moneyIcon from "../images/app-icon.svg";
import useExpenseStore, { timer } from "../store/usePersonStore";
import utils from "../utils/utils";
import MonthPicker from "./MonthPicker";
import "./NavBar.css";
import authService from "../core/authService";
import OfflineAlert from "./OfflineAlert";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";

export default function NavBar() {
  const month = useExpenseStore((store) => store.monthYear);
  const setMonthYear = useExpenseStore((store) => store.setMonthYear);
  const navigate = useNavigate();

  const onMonthChange = (monthYear: string) => {
    setMonthYear(monthYear);
  };

  const logout = () => {
    timer.timeout();
    confirmDialog({
      message: "Are you sure you want to log out?",
      header: "Logout Confirmation",
      icon: "pi pi-info-circle",
      position: "top",
      accept: () => {
        authService.logout(navigate);
      },
    });
  };

  return (
    <div className="nav-bar">
      <ConfirmDialog />
      <OfflineAlert></OfflineAlert>
      <div
        className="blur-bg flex justify-content-center"
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
