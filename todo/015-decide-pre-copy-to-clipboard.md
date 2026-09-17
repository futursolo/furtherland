# Decide: add a copy-to-clipboard button to `Pre`?

- **Status:** 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §3 Elements → Element TODOs

## Context

`Pre` (v4 `Mdx/Pre.astro` → v5 `elements/Pre.tsx`) uses the same Shiki dual
`github-light`/`github-dark` theme in both. **Neither version** has a copy-to-clipboard button (the
v4 comment hints one was removed earlier). Adding one would be a **new feature**, not a regression.

## Action (decide)

- [ ] Decide whether to *add* a copy-to-clipboard button to `Pre` in v5.
- [ ] If yes, implement it in `elements/Pre.tsx`.

## References

- `packages/frontend-v5/src/elements/Pre.tsx`
- v4 counterpart: `Mdx/Pre.astro` (see `TODOs.md` §3)
