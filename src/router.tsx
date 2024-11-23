import { createBrowserRouter } from "react-router-dom";
import Errorpage from "./pages/Errorpage";
import HomePage from "./pages/Homepage";
import Layout from "./pages/Layout";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Layout />,
    errorElement: <Errorpage />,
    children: [{ index: true, element: <HomePage /> }],
  },
]);

export default router;
