import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router";
import { HelmetProvider } from "react-helmet-async";
import { IconContext } from "@phosphor-icons/react";
import App from "./app/App.tsx";
import "./styles/index.css";

const routerBase = import.meta.env.BASE_URL === '/' ? '/' : import.meta.env.BASE_URL.replace(/\/$/, '');

createRoot(document.getElementById("root")!).render(
  <IconContext.Provider value={{ weight: "duotone" }}>
    <HelmetProvider>
      <BrowserRouter basename={routerBase}>
        <App />
      </BrowserRouter>
    </HelmetProvider>
  </IconContext.Provider>
);
