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
