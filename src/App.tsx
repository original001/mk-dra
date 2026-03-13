import { Suspense, use, useMemo } from "react";
import "./App.css";
import { atom, useAtom } from "jotai";
import { useAsyncAtom, useSyncedAtom } from "./helpers";
import { createDra } from "./createDra";
import { ErrorBoundary } from "react-error-boundary";
import type { OperationResult } from "@skbkontur/loader-builder";
import { WidgetFaultError } from "./WidgetFaultError";
import type { ModuleDra } from "./asyncAtom";

const textAtom = atom("my-text");

const UpperCased = ({ text }: { text: string }) => {
  return <span>{text}</span>;
};

const AsyncComponent = ({ promise }: { promise: Promise<OperationResult<any, string>> }) => {
  const renderApi = use(promise);
  if (!renderApi.success) throw new WidgetFaultError(renderApi.fault);
  return <UpperCased text={renderApi.value} />;
};

const showAtom = atom(true);

const useRenderDra = (moduleDra: ModuleDra, text: string) => {
  const syncParams = useMemo(() => ({ text }), [text]);
  const syncParamsAtom = useSyncedAtom(syncParams);

  const { asyncAtom, refresh } = useMemo(
    () =>
      createDra(
        (syncParams, token, result) => result.getValue({ text: syncParams.text, token }),
        syncParamsAtom,
        "render",
        moduleDra,
      ),
    [moduleDra],
  );

  const renderPromise = useAsyncAtom(asyncAtom);

  return { promise: renderPromise, refresh };
};


function App({ moduleDra }: { moduleDra: ModuleDra }) {
  const [isShowed, setIsShowed] = useAtom(showAtom);
  return (
    <Suspense fallback="Loading...">
      <input type="checkbox" checked={isShowed} onChange={() => setIsShowed(!isShowed)} />
      {isShowed && <Comp moduleDra={moduleDra} />}
    </Suspense>
  );
}

function Comp({ moduleDra }: { moduleDra: ModuleDra }) {
  const [text, setText] = useAtom(textAtom);
  const { promise, refresh } = useRenderDra(moduleDra, text);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <ErrorBoundary
        fallbackRender={({ error }) => (
          <>
            <h3>Ошибка {(error as WidgetFaultError).type}</h3>
            {(error as WidgetFaultError).type !== "import-fault" ? (
              <button
                onClick={() => {
                  refresh();
                }}
              >
                Попробовать еще раз
              </button>
            ) : (
              <button
                onClick={() => {
                  window.location.reload();
                }}
              >
                Перезагрузить страницу
              </button>
            )}
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

export default App;
