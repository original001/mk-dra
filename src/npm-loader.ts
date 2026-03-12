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

export interface Disposable {
  dispose: () => Promise<void>;
}

export type WidgetApi = {
  getValue: (text: string) => Promise<
    {
      value: string;
    } & Disposable
  >;
} & Disposable;

export async function importWidgetApi(): Promise<WidgetApi> {
  await wait(200);
  changeSideEffect(+1);
  console.log("widget: creating module");
  return {
    getValue: async (text: string) => {
      await wait(200);
      const shouldThrow = Math.random() < 0.5;
      // const shouldThrow = true;

      if (shouldThrow) {
        throw new Error("Operation failed randomly");
      }
      console.log("render: creating", text);
      changeSideEffect(+1);
      return {
        value: text.toUpperCase(),
        dispose: memo(async () => {
          await wait(200);
          console.log("render: disposing", text);
          changeSideEffect(-1);
        }),
      };
    },
    dispose: memo(async () => {
      await wait(200);
      console.log("widget: disposing module");
      changeSideEffect(-1);
    }),
  };
}
