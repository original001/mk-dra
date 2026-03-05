export function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

function changeSideEffect(diff: number) {
  const sideEffects = document.getElementById('side-effects')!;
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

export async function importWidgetModule(text: string) {
  changeSideEffect(+1);
  await wait(200);
  return {
    value: text.toUpperCase(),
    dispose: memo(async () => {
      await wait(200);
      changeSideEffect(-1);
    }),
  };
}
