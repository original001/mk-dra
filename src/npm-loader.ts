import {
  beginCancellationTokenScope,
  type AsyncCancellationToken,
} from "@skbkontur/async-cancellation-token";
import {
  createSuccess,
  withCancellationToken,
  type WidgetFaultConstraint,
  type WithCancellationTokenOriginalFunction,
} from "@skbkontur/loader-builder";

export function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function changeSideEffect(diff: number) {
  const sideEffects = document.getElementById("side-effects")!;
  sideEffects.innerText = `${+sideEffects.innerText + diff}`;
}

function memo<T>(fn: () => T): () => T {
  let cache: T | null = null;
  return () => {
    if (cache === null) {
      cache = fn();
    }
    return cache;
  };
}
export type WidgetApi = {
  getValue: WithCancellationTokenOriginalFunction<
    WidgetFaultConstraint,
    object,
    { text: string },
    WidgetFaultConstraint,
    string
  >;
};

export async function importWidgetApi(token: AsyncCancellationToken<any, object>): Promise<WidgetApi> {
  console.log("widget: creating module");

  const scope = beginCancellationTokenScope(token);

  if (scope.isCancelled) {
    throw new Error("Только что созданный скоуп отменён");
  }

  await wait(200);
  changeSideEffect(+1);

  scope.register(async () => {
    changeSideEffect(-1);
  });

  scope.dispose();

  return {
    getValue: withCancellationToken({
      token,
      handler: async ({ text, token }) => {
        await wait(200);

        changeSideEffect(+1);

        token.register(async () => {
          console.log("render: disposing", text);
          changeSideEffect(-1);
          return createSuccess({});
        });

        const shouldThrow = Math.random() < 0.5;

        if (shouldThrow) {
          throw new Error("Operation failed randomly");
        }
        console.log("render: creating", text);
        return createSuccess(text.toUpperCase());
      },
    }),
  };
}
