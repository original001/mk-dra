import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { asyncAtom } from "./asyncAtom.tsx";



createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <App moduleDra={asyncAtom} />,
  // </StrictMode>,
);
