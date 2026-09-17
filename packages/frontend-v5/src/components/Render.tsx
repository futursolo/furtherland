import type { ComponentType } from 'react';
import { type ReactNode, useEffect, useRef, useState } from 'react';

import ClientOnly from './ClientOnly';
import LazyOnly from './LazyOnly';

type LoadedModule<T> = T | { default: T };

type RenderProps<T extends ComponentType<P>, P> = {
  load: () => Promise<LoadedModule<T>>;
  render: (Comp: T) => ReactNode;
  method?: 'lazy' | 'normal';
};

// Resolves the module from `load` and hands the component to `render`.
// It is mounted only once its wrapper renders it — on mount for `normal`
// (via `ClientOnly`) or when the sentinel scrolls into view for `lazy`
// (via `LazyOnly`). The import runs exactly once, on first mount; later
// re-renders never re-trigger it, and unmounting before it resolves discards
// the result.
const Loader = <T extends ComponentType<P>, P>({
  load,
  render,
}: Omit<RenderProps<T, P>, 'method'>) => {
  const loadRef = useRef(load);
  loadRef.current = load;

  const [Comp, setComp] = useState<T | null>(null);

  useEffect(() => {
    let cancelled = false;

    loadRef.current().then((mod) => {
      if (cancelled) {
        return;
      }

      const resolved = mod && 'default' in mod ? mod.default : mod;
      setComp(resolved ?? null);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  if (!Comp) {
    return null;
  }

  return render(Comp);
};

// Renders a dynamically imported component. `method` controls when `load` is
// awaited: `normal` loads as soon as it is rendered on the client, while
// `lazy` waits until the placeholder scrolls into view before loading.
const Render = <T extends ComponentType<P>, P>(props: RenderProps<T, P>) => {
  const content = <Loader<T, P> load={props.load} render={props.render} />;

  if (props.method === 'lazy') {
    return <LazyOnly>{content}</LazyOnly>;
  }

  return <ClientOnly>{content}</ClientOnly>;
};

export default Render;
