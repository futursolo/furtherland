import { createStart } from '@tanstack/react-start';

// Matches the TanStack Start default start entry: `startInstance` stays
// `undefined` so the build config (e.g. prerendering) continues to come from the
// `tanstackStart` Vite plugin options. The `createStart` import is re-exported
// (kept "used") so that importing this entry pulls `@tanstack/react-start`'s
// route-type augmentation — which adds the `server` route option — into the
// program, letting server routes (e.g. `/robots.txt`) type-check under `tsc`.
export const startInstance = undefined;
export { createStart };
