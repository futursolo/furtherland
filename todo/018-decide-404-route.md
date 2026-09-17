# Decide 404 handling + restore the `noindex` robots meta

- **Status:** 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §5 Routes/Pages → Route TODOs

## Context

v4 had a dedicated `pages/404.astro` that set `<meta name="robots" content="noindex">`
(`404.astro:11`). v5 has **no 404 route file**; instead the root `notFoundComponent`
(`__root.tsx:12-30,61`) doubles as the not-found handler for a loader's `notFound()`. The v5
`NotFound` component sets **no** `noindex` robots meta.

## Action (decide)

- [ ] Implement the same 404 page as v4 for both not found component and /404.tsx.

## References

- `packages/frontend-v5/src/routes/__root.tsx:12-30,54-60,61`
- v4 counterpart: `pages/404.astro:11` (see `TODOs.md` §5)

