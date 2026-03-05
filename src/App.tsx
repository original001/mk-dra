import { Suspense, use, useEffect, useState, type Usable } from "react";
import "./App.css";
import { atom, useAtom, useAtomValue, getDefaultStore, type Atom } from "jotai";
import { renderWithSideEffect, wait } from "./helpers";

const textAtom = atom("my-text");

const oldDisposeRef = atom({ dispose: async () => {} });

const refreshAtom = atom(0);

const refresher = atom(
  (get) => get(refreshAtom),
  (_, set) => set(refreshAtom, (c) => c + 1),
);

let counter = 0;

const widgetAtom = atom(
  async (get) => {
    const _counter = counter++;
    console.log("run get", _counter);
    get(refresher);
    const ref = get(oldDisposeRef);
    const getNewRes = (async () => {
      console.log("creating", _counter);
      await ref.dispose();
      return await renderWithSideEffect(get(textAtom) + _counter);
    })();
    const resPromise = getNewRes.then((x) => x.value);
    console.log("adding dispose", _counter);
    ref.dispose = () => getNewRes.then((x) => x.dispose());
    return resPromise;
  },
  (get, set) => {
    console.log("cleanup");
    get(oldDisposeRef).dispose();
    set(refresher);
  },
);

widgetAtom.onMount = (set) => {
  return () => {
    set();
  };
};

const UpperCased = ({ promise }: { promise: Promise<string> }) => {
  const text = use(promise);
  return <span>{text}</span>;
};

const eternalPromise: Promise<never> = {
  [Symbol.toStringTag]: "eternal promise from @skbkontur/widget-consumer-jotai-utils",
  then: () => eternalPromise,
  catch: () => eternalPromise,
  finally: () => eternalPromise,
};

const useAsyncAtom = (asyncAtom: Atom<Promise<string>>) => {
  const [promise, setPromise] = useState<Promise<string | never>>(eternalPromise);
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
  }, []);
  return promise;
};

const AsyncComponent = () => {
  const promise = useAsyncAtom(widgetAtom);
  return <UpperCased promise={promise} />;
};

const showAtom = atom(true);
function Comp() {
  const [text, setText] = useAtom(textAtom);
  const [isShowed, setIsShowed] = useAtom(showAtom);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <input type="checkbox" checked={isShowed} onChange={() => setIsShowed(!isShowed)} />
      <Suspense fallback="Loading...">{isShowed && <AsyncComponent />}</Suspense>
    </div>
  );
}

export default Comp;
