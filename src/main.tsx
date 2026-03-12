import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createDra } from "./createDra.tsx";
import { importWidgetApi } from "./npm-loader.ts";
import { atom, getDefaultStore } from "jotai";

const {asyncAtom} = createDra(() => importWidgetApi(), atom({}), "module");

// const store = getDefaultStore();
// const unsub = store.sub(asyncAtom, () => {});

// setTimeout(() => {
//   unsub();
// }, 2000);

createRoot(document.getElementById("root")!).render(
  // <StrictMode>
  <App moduleDra={asyncAtom} />,
  // </StrictMode>,
);
