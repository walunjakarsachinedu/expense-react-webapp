import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import OfflineAlert from "../components/OfflineAlert";

const Layout = () => {
  return (
    <>
      <NavBar></NavBar>
      <div style={{ height: 70 }}></div>
      <Outlet></Outlet>
    </>
  );
};

export default Layout;
