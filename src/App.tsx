import { Suspense, use, useMemo } from "react";
import "./App.css";
import { atom, useAtom } from "jotai";
import { type Disposable, type WidgetApi } from "./npm-loader";
import { useAsyncAtom, useSyncedAtom } from "./helpers";
import { createDra } from "./createDra";
import type { WritableAtom } from "jotai";
import { ErrorBoundary } from "react-error-boundary";

const textAtom = atom("my-text");

const UpperCased = ({ text }: { text: string }) => {
  return <span>{text}</span>;
};

const AsyncComponent = ({ promise }: { promise: Promise<Disposable & { value: string }> }) => {
  const renderApi = use(promise);
  return <UpperCased text={renderApi.value} />;
};

const showAtom = atom(true);

const useRenderDra = (moduleDra: WritableAtom<Promise<WidgetApi>, [], void>, text: string) => {
  const syncParams = useMemo(() => ({ text }), [text]);
  const syncParamsAtom = useSyncedAtom(syncParams);

  const { asyncAtom, refresh } = useMemo(
    () => createDra((syncParams, result) => result!.getValue(syncParams.text), syncParamsAtom, "render", moduleDra),
    [moduleDra],
  );

  const renderPromise = useAsyncAtom(asyncAtom);

  return { promise: renderPromise, refresh };
};

function App({ moduleDra }: { moduleDra: WritableAtom<Promise<WidgetApi>, [], void> }) {
  const [isShowed, setIsShowed] = useAtom(showAtom);
  return (
    <Suspense fallback="Loading...">
      <input type="checkbox" checked={isShowed} onChange={() => setIsShowed(!isShowed)} />
      {isShowed && <Comp moduleDra={moduleDra} />}
    </Suspense>
  );
}

function Comp({ moduleDra }: { moduleDra: WritableAtom<Promise<WidgetApi>, [], void> }) {
  const [text, setText] = useAtom(textAtom);
  const { promise, refresh } = useRenderDra(moduleDra, text);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <>
            <h1>Ошибка {error.message}</h1>
            <button
              onClick={() => {
                refresh();
              }}
            >
              reset
            </button>
          </>
        )}
        resetKeys={[promise]}
      >
        <Suspense fallback="Loading...">
          <AsyncComponent promise={promise} />
        </Suspense>
      </ErrorBoundary>
    </div>
  );
}
// function App() {
//   const [isShowed, setIsShowed] = useState(true);
//   return (
//     <>
//       <input type="checkbox" checked={isShowed} onChange={() => setIsShowed(!isShowed)} />

//       {isShowed && <Context />}
//     </>
//   );
// }

export default App;
