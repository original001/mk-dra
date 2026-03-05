Баг двойной:

# 1. Приколы с Suspense

Подсказка 1: добавь логи

- в атоме: в геттере и в анмаунте
- в реакте: до `useAtomValue`, в `useEffect`

Подсказка 2: посмотри реализацию `useAtomValue` в `jotai`, найди там `use(promise)`, `store.get` и `store.sub`

Подсказка 3: объяснение с доклада https://youtu.be/Cv3tjwpxq6Y?si=VJcNsc3Qgc1y95sV&t=1920. Смотреть до 38:40, дальше будет спойлер

Подсказка 4: useAtomValue не годится, нужен другой хук, который не будет дергать get до подписки

Подсказка 5: рендер все равно дернется до эффекта. Что передавать в `use(promise)` такому рендеру, когда useEffect еще не произошел?

Подсказка 6: такой хук не может жить внутри Suspense, надо положить его снаружи, а внутри Suspense дергать только `use(promise)`

Решение: https://stackblitz.com/edit/vitejs-vite-sjtabtl5?file=src%2FuseAsyncAtomValue.ts

Но подстава: даже если перестанет теряться unmount, баг с единичкой остался

# 2. Приколы с jotai

Подсказка 1: добавь логи в геттере атома и посмотри, кто и зачем его дергает

Подсказка 2: см. наш тред с jotai https://github.com/pmndrs/jotai/discussions/3124

Решение: обернуть атом счетчика в +1 атом, см. refresher тут https://stackblitz.com/edit/vitejs-vite-sjtabtl5?file=src%2FApp.tsx

Альтернатива: `if (!get(isMounted)) return undefined as never;`

После этого должно заработать. Если нет, ищи отличия с нашим решением https://stackblitz.com/edit/vitejs-vite-sjtabtl5?file=src%2FApp.tsx

# Усложнения после проверки

## 1. StrictMode

Добавь в корне `<StrictMode>`, должно продолжать работать.

## 2. Эксперимент с Suspense повыше (по мотивам вопроса Вовы)

Попробуй убрать `<Suspense>` изнутри своих компонентов и переставить повыше -- например, в корень приложения. Должна получится вечная загрузка. Осознай, как так.
