import { createAsyncCancellationTokenSource, type AsyncCancellationToken } from "@skbkontur/async-cancellation-token";
import { createFailure, type OperationResult } from "@skbkontur/loader-builder";
import { type PrimitiveAtom, atom, getDefaultStore } from "jotai";
import type { WritableAtom } from "jotai";

export function createDra<TValue, TParams, TParentResult, TParentFault, TCreateFault>(
  create: (
    syncParams: TParams,
    token: AsyncCancellationToken<any, object>,
    parentResult: TParentResult,
  ) => Promise<OperationResult<TCreateFault, TValue>>,
  syncParams: PrimitiveAtom<TParams>,
  name: string,
  parentDra: WritableAtom<Promise<OperationResult<TParentFault, TParentResult>>, [], void>,
) {
  const store = getDefaultStore();

  const refresher = atom(
    (get) => get(refreshAtom),
    (_, set) => set(refreshAtom, (c) => c + 1),
  );
  const refreshAtom = atom(0);

  let counter = 0;
  const lastMutableTcsRef = atom({ cancel: async (_reason: object) => [] as void[] });

  const disposeRefreshAtom = atom(
    async (get) => {
      const _counter = counter++;
      console.log("run get", name, _counter);
      get(refresher);
      const _syncParams = get(syncParams);
      await get(lastMutableTcsRef).cancel({});

      const result = await get(parentDra);

      if (!result.success) {
        return createFailure(result.fault);
      }

      const tcs = createAsyncCancellationTokenSource<void, object>();

      get(lastMutableTcsRef).cancel = tcs.cancel;

      const createResult = await create(_syncParams, tcs.token, result.value);
      if (!createResult.success) {
        tcs.cancel({});
      }
      return createResult;
    },
    (get, set) => {
      console.log("cleanup");
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
