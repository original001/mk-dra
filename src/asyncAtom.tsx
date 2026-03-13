import { createSuccess } from "@skbkontur/loader-builder";
import { atom } from "jotai";
import { createDra } from "./createDra";
import { importWidgetApi } from "./npm-loader";

export const { asyncAtom } = createDra(
  (_, token) => importWidgetApi(token),
  atom({}),
  "module",
  atom(
    async (_get) => createSuccess({}),
    (_get, _set) => { }
  )
);

// const store = getDefaultStore();
// const unsub = store.sub(asyncAtom, () => {});

// setTimeout(() => {
//   unsub();
// }, 2000);

export type ModuleDra = typeof asyncAtom;