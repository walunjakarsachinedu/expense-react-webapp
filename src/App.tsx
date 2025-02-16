// css imports
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "./theme/colors.css";
import "./theme/theme.css";

import { PrimeReactProvider } from "primereact/api";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import router from "./router";
import { TimerProvider } from "./services/TimerContext";
import { ToastProvider } from "./services/ToasterContext";

function App() {
  return (
    <TimerProvider>
      <PrimeReactProvider>
        <ToastProvider>
          <RouterProvider router={router} />
        </ToastProvider>
      </PrimeReactProvider>
    </TimerProvider>
  );
}

export default App;
