import { createAsyncCancellationTokenSource, type AsyncCancellationToken } from "@skbkontur/async-cancellation-token";
import { type PrimitiveAtom, atom, getDefaultStore } from "jotai";
import type { WritableAtom } from "jotai";

export function createDra<TValue, TParams, TParentResult>(
  create: (syncParams: TParams, token: AsyncCancellationToken<any, object>, parentResult?: TParentResult) => Promise<TValue>,
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
  // const oldDisposeRef = atom({ dispose: async () => {} });
  const lastMutableTcsRef = atom({cancel: async (_reason: object) => [] as void[]})

  const disposeRefreshAtom = atom(
    async (get) => {
      const _counter = counter++;
      console.log("run get", name, _counter);
      get(refresher);
      // const ref = get(oldDisposeRef);
      const _syncParams = get(syncParams);
      const result = parentDra ? await get(parentDra) : undefined;

      const tcs  = createAsyncCancellationTokenSource<void, object>();

      await get(lastMutableTcsRef).cancel({});

      get(lastMutableTcsRef).cancel = tcs.cancel

      return await create(_syncParams, tcs.token, result);

      // const getNewRes = (async () => {
      //   console.log("creating", name, _counter);
      //   try {
      //     await ref.dispose();
      //   } catch (e) {}
      // })();
      // const resPromise = getNewRes.then((x) => x);
      // console.log("adding dispose", name, _counter);
      // ref.dispose = () => getNewRes.then((x) => x.dispose());
    },
    (get, set) => {
      console.log("cleanup");
      // get(oldDisposeRef).dispose();
      // token.cancel();
      get(lastMutableTcsRef).cancel({});

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
