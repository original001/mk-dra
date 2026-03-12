import { type Atom, getDefaultStore, useSetAtom } from "jotai";
import { useState, useEffect, useMemo } from "react";
import { atomWithLazy } from "jotai/utils";

export function useAsyncAtom<T>(asyncAtom: Atom<Promise<T>>) {
  const [promise, setPromise] = useState<Promise<T | never>>(eternalPromise);
  const store = getDefaultStore();
  const handle = () => {
    setPromise(store.get(asyncAtom));
  };
  useEffect(() => {
    handle();
    const unsub = store.sub(asyncAtom, () => {
      handle();
    });
    return () => {
      unsub();
    };
  }, [asyncAtom]);
  return promise;
}

export function useSyncedAtom<TParams>(params: TParams) {
  const valAtom = useMemo(
    () =>
      atomWithLazy<TParams>(() => {
        throw "not set";
      }),
    [],
  );
  const setter = useSetAtom(valAtom);
  useEffect(() => {
    setter(params);
  }, [params]);
  return valAtom;
}

export const eternalPromise: Promise<never> = {
  [Symbol.toStringTag]: "eternal promise from @skbkontur/widget-consumer-jotai-utils",
  then: () => eternalPromise,
  catch: () => eternalPromise,
  finally: () => eternalPromise,
};
