// css imports
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "./theme/colors.scss";
import "./theme/theme.scss";

import { PrimeReactProvider } from "primereact/api";
import "./App.scss";
import AppRouter from "./AppRouter";
import { TimerProvider } from "./services/TimerContext";
import { ToastProvider } from "./services/ToasterContext";
import { BrowserRouter } from "react-router-dom";
import { InfoDialog } from "./components/info-dialog";
import { enableMapSet } from "immer";
import { ContextMenuProvider } from "./components/ContextMenuProvider";

enableMapSet();

function App() {
  return (
    <TimerProvider>
      <PrimeReactProvider>
        <ContextMenuProvider>
          <ToastProvider>
            <BrowserRouter>
              <AppRouter></AppRouter>
              <InfoDialog />
            </BrowserRouter>
          </ToastProvider>
        </ContextMenuProvider>
      </PrimeReactProvider>
    </TimerProvider>
  );
}

export default App;
