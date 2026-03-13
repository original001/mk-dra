import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { createDra } from "./createDra.tsx";
import { importWidgetApi } from "./npm-loader.ts";
import { atom } from "jotai";
import { createAsyncCancellationTokenSource } from "@skbkontur/async-cancellation-token";


const { asyncAtom } = createDra((_, token) => importWidgetApi(token), atom({}), "module");

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
