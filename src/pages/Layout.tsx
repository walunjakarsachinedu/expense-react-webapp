import { Outlet } from "react-router-dom";
import NavBar from "../components/NavBar";
import useIsOffline from "../hooks/useIsOffline";

const Layout = () => {
  const isOffline = useIsOffline();
  return (
    <>
      <NavBar></NavBar>
      <div style={{ height: isOffline ? 90 : 70 }}></div>
      <Outlet></Outlet>
    </>
  );
};

export default Layout;
