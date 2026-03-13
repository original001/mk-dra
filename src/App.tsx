import { Suspense, use, useMemo } from "react";
import "./App.css";
import { atom, useAtom } from "jotai";
import { type WidgetApi } from "./npm-loader";
import { useAsyncAtom, useSyncedAtom } from "./helpers";
import { createDra } from "./createDra";
import type { WritableAtom } from "jotai";
import { ErrorBoundary } from "react-error-boundary";
import type { OperationResult, WidgetFaultConstraint } from "@skbkontur/loader-builder";

const textAtom = atom("my-text");

const UpperCased = ({ text }: { text: string }) => {
  return <span>{text}</span>;
};

const AsyncComponent = ({ promise }: { promise: Promise<OperationResult<WidgetFaultConstraint, string>> }) => {
  const renderApi = use(promise);
  if (!renderApi.success) throw new Error(renderApi.fault.message);
  return <UpperCased text={renderApi.value} />;
};

const showAtom = atom(true);

const useRenderDra = (moduleDra: WritableAtom<Promise<WidgetApi>, [], void>, text: string) => {
  const syncParams = useMemo(() => ({ text }), [text]);
  const syncParamsAtom = useSyncedAtom(syncParams);

  const { asyncAtom, refresh } = useMemo(
    () =>
      createDra(
        (syncParams, token, result) => result!.getValue({ text: syncParams.text, token }),
        syncParamsAtom,
        "render",
        moduleDra,
      ),
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
            <h3>Ошибка {(error as { message: string }).message}</h3>
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
