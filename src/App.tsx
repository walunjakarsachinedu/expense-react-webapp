// css imports
import "primeflex/primeflex.css";
import "primeicons/primeicons.css";
import "primereact/resources/primereact.min.css";
import "primereact/resources/themes/lara-dark-indigo/theme.css";
import "./theme/colors.css";
import "./theme/theme.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { PrimeReactProvider } from "primereact/api";
import { RouterProvider } from "react-router-dom";
import "./App.css";
import router from "./router";
import { TimerProvider } from "./services/TimerContext";
import { ToastProvider } from "./services/ToasterContext";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TimerProvider>
        <PrimeReactProvider>
          <ToastProvider>
            <RouterProvider router={router} />
          </ToastProvider>
        </PrimeReactProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </TimerProvider>
    </QueryClientProvider>
  );
}

export default App;
