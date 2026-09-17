import type { ComponentType, ReactNode } from 'react';
import { Suspense, use, useMemo } from 'react';

import ClientOnly from './ClientOnly';
import LazyOnly from './LazyOnly';

type LoadedModule<T> = T | { default: T };

type RenderProps<T extends ComponentType<P>, P> = {
  load: () => Promise<LoadedModule<T>>;
  render: (Comp: T) => ReactNode;
  method?: 'lazy' | 'normal';
};

// Resolves the module from `load` via `use()` and hands the component to
// `render`. `load()` runs exactly once: its promise is memoized via `useMemo` so
// it stays referentially stable across renders, and `use()` suspends until it
// settles; the surrounding `Suspense` (blank fallback) keeps the slot empty
// until then. `Loader` is mounted only once its wrapper renders it — on mount
// for `normal` (via `ClientOnly`) or when the sentinel scrolls into view for
// `lazy` (via `LazyOnly`) — and unmounting before the promise resolves discards
// the in-flight load.
const Loader = <T extends ComponentType<P>, P>({
  load,
  render,
}: Omit<RenderProps<T, P>, 'method'>) => {
  // biome-ignore lint/correctness/useExhaustiveDependencies: omit `load` so the promise is created once and stays referentially stable for `use()`; recomputing on a new `load` would re-trigger the import
  const promise = useMemo(() => load(), []);
  const mod = use(promise);
  const resolved = mod && 'default' in mod ? mod.default : mod;

  if (!resolved) {
    return null;
  }

  return render(resolved);
};

// Renders a dynamically imported component. `method` controls when `load` is
// triggered: `normal` loads as soon as it is rendered on the client, while
// `lazy` waits until the placeholder scrolls into view before loading. The
// loader suspends behind a blank `Suspense` fallback until the import resolves.
const Render = <T extends ComponentType<P>, P>(props: RenderProps<T, P>) => {
  const content = (
    <Suspense fallback={null}>
      <Loader<T, P> load={props.load} render={props.render} />
    </Suspense>
  );

  if (props.method === 'lazy') {
    return <LazyOnly>{content}</LazyOnly>;
  }

  return <ClientOnly>{content}</ClientOnly>;
};

export default Render;
