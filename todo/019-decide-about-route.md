# Decide `/about` route (hardcoded starter vs content-driven page)

- **Status:** 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §5 Routes/Pages → Route TODOs

## Context

v5 added a **new** top-level `/about` route (`routes/about.tsx`) that is a **hardcoded TanStack
starter**: it uses Tailwind classes (`page-wrap` / `island-shell`) and an undefined `--sea-ink`
variable, and it **bypasses** the `Page` layout and `ThemeProvider`. It **coexists** with the
content-driven `/pages/about` (published from `packages/contents/src/pages/about.mdx`). v4 had no
top-level `/about` (About was only reachable via `/pages/about` MDX).

## Action (decide)

- [ ] Decide between:
  - (a) keep both routes,
  - (b) delete the hardcoded starter `routes/about.tsx`, **or**
  - (c) make `/about` render the `about.mdx` content.
- [ ] Apply the decision (and remove the stale Tailwind / `--sea-ink` usage if the starter stays).

## References

- `packages/frontend-v5/src/routes/about.tsx`
- `packages/contents/src/pages/about.mdx`
- v4: no top-level `/about` (see `TODOs.md` §5)
