// css imports
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "./theme/colors.css";
import "./theme/theme.css";

import { PrimeReactProvider } from "primereact/api";
import "./App.css";
import AppRouter from "./AppRouter";
import { TimerProvider } from "./services/TimerContext";
import { ToastProvider } from "./services/ToasterContext";
import { BrowserRouter } from "react-router-dom";

function App() {
  return (
    <TimerProvider>
      <PrimeReactProvider>
        <ToastProvider>
          <BrowserRouter>
            <AppRouter></AppRouter>
          </BrowserRouter>
        </ToastProvider>
      </PrimeReactProvider>
    </TimerProvider>
  );
}

export default App;
