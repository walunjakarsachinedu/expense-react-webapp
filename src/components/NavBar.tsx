import { ReactNode } from "react";
import moneyIcon from "../images/money-icon.svg";
import "./NavBar.css";

export default function NavBar() {
  return (
    <div className="nav-bar">
      <div
        className="blur-bg flex justify-content-center"
        style={{
          width: "100%",
          padding: 10,
          paddingRight: 15,
          background: "rgba(200,200,200,.02)",
        }}
      >
        <Row>
          <img
            src={moneyIcon}
            alt="Icon"
            style={{ marginRight: 10, height: "16px" }}
          />
          <b>Expense Tracker</b>
        </Row>

        <div style={{ width: 70 }}></div>

        <Row>
          <div className="mr-3"></div>
          <div className="pi pi-calendar icon-btn cursor-pointer"></div>
          <div className="mr-3"></div>
          <div className="pi pi-sign-out icon-btn cursor-pointer"></div>
        </Row>
      </div>
    </div>
  );
}

type Props = {
  children: ReactNode;
};

function Row({ children }: Props) {
  return <div className="flex align-items-center">{children}</div>;
}
