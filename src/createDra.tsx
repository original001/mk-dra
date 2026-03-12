import { type PrimitiveAtom, atom, getDefaultStore } from "jotai";
import type { Disposable } from "./npm-loader";
import type { WritableAtom } from "jotai";

export function createDra<TValue, TParams, TParentResult>(
  create: (syncParams: TParams, parentResult?: TParentResult) => Promise<Disposable & TValue>,
  syncParams: PrimitiveAtom<TParams>,
  name: string,
  parentDra?: WritableAtom<Promise<TParentResult>, [], void>,
) {
  const store = getDefaultStore();

  const refresher = atom(
    (get) => get(refreshAtom),
    (_, set) => set(refreshAtom, (c) => c + 1),
  );
  const refreshAtom = atom(0);

  let counter = 0;
  const oldDisposeRef = atom({ dispose: async () => {} });

  const disposeRefreshAtom = atom(
    async (get) => {
      const _counter = counter++;
      console.log("run get", name, _counter);
      get(refresher);
      const ref = get(oldDisposeRef);
      const _syncParams = get(syncParams);
      const result = parentDra ? await get(parentDra) : undefined;
      const getNewRes = (async () => {
        console.log("creating", name, _counter);
        try {
          await ref.dispose();
        } catch (e) {}
        return await create(_syncParams, result);
      })();
      const resPromise = getNewRes.then((x) => x);
      console.log("adding dispose", name, _counter);
      ref.dispose = () => getNewRes.then((x) => x.dispose());
      return resPromise;
    },
    (get, set) => {
      console.log("cleanup");
      get(oldDisposeRef).dispose();
      set(refresher);
    },
  );

  disposeRefreshAtom.onMount = (set) => {
    return () => {
      console.log("unmount atom", name);
      set();
    };
  };

  return { asyncAtom: disposeRefreshAtom, refresh: () => store.set(refresher) };
}
