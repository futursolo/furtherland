import type { ComponentType } from 'react';

export type MdxComponent = ComponentType<{
  components?: Record<string, unknown>;
}>;

export type MdxModule = {
  default: MdxComponent;
  frontmatter?: Record<string, unknown>;
};

/** A Rspack context module, as returned by `import.meta.webpackContext`. */
export type WebpackContext = {
  keys(): Array<string>;
  (request: string): unknown;
};

/**
 * Build a `Record<path, () => Promise<T>>` map from a Rspack context module.
 * Equivalent to Vite's `import.meta.glob`, but resolved through Rspack's
 * resolver so path aliases (e.g. `@@contents`) are honored.
 */
export const modulesFromContext = <T>(
  context: WebpackContext,
): Record<string, () => Promise<T>> => {
  const modules: Record<string, () => Promise<T>> = {};
  for (const key of context.keys()) {
    modules[key] = () => context(key) as Promise<T>;
  }
  return modules;
};
