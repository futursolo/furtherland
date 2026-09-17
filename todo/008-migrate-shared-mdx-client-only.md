# Migrate shared MDX Astro `client:only` blocks to the v5 idiom

- **Status:** 🟠 MISSING
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #6; §5 Routes/Pages → Route TODOs

## Context

Shared posts (e.g. the draft `packages/contents/src/posts/2099-12-31/test.mdx:35,43`) use the Astro
`client:only="react"` directive for `<BarChart>` / `<RadarChart>`. v5's `@mdx-js/rollup` does **not**
interpret that directive — the attribute lands on the component as a plain prop during SSR, so
**client-only charts would be SSR-rendered in v5** (breaking the client-only intent).

## Action

- [ ] Migrate the shared MDX blocks that use `client:only="react"` to the v5 `ClientOnly` /
  `LazyOnly` idiom (see `ClientOnly.tsx` / `LazyOnly.tsx`).
- [ ] Audit all shared content under `packages/contents/src/**` for remaining Astro `client:*`
  directives and migrate each.
- [ ] Confirm the draft `test.mdx` charts no longer SSR in v5.

## References

- `packages/frontend-v5/src/components/ClientOnly.tsx`
- `packages/frontend-v5/src/components/LazyOnly.tsx`
- `packages/contents/src/posts/2099-12-31/test.mdx:35,43` (see `TODOs.md` §5)
