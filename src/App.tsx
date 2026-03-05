import { Suspense } from 'react';
import './App.css';
import { atom, useAtom } from 'jotai';
import { renderWithSideEffect } from './helpers';

const textAtom = atom('my-text');

const asyncAtom = atom(async (get) => {
  const { value, dispose: _whoNeedsDispose } = await renderWithSideEffect(
    get(textAtom)
  );
  return value;
});

const RenderComponent = () => {
  return (
    <Suspense fallback="loading">
      <UseAtomValue />
    </Suspense>
  );
};

const UseAtomValue = () => {
  const [val] = useAtom(asyncAtom);
  return <>{val}</>;
};

const showAtom = atom(true);
function Comp() {
  const [text, setText] = useAtom(textAtom);
  const [isShowed, setIsShowed] = useAtom(showAtom);
  return (
    <div>
      <input value={text} onChange={(e) => setText(e.target.value)} />
      <input type="checkbox" checked={isShowed} onChange={() => setIsShowed(!isShowed)} />
      {isShowed && <RenderComponent />}
    </div>
  );
}

export default Comp;
