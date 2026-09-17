# Remove unused `styles/theme.scss` (stale v4/Astro comments)

- **Status:** ⚪ CLEANUP
- **Priority:** low
- **Found in:** `TODOs.md` → §6 Cross-cutting infra → Theme representation

## Context

v5 copied v4's `styles/theme.scss` but it is **unused** — v5 consumes a JS theme object via Emotion
(`providers/theme.tsx`), not the SCSS partial. The file's comments still describe the v4/Astro
setup, so it is dead, misleading code.

## Action

- [ ] Delete `styles/theme.scss` (or confirm it is genuinely unreferenced and remove it).
- [ ] Verify the build is unaffected (v4-era values already live in the `ThemeProvider` `<Global>`).

## References

- `packages/frontend-v5/src/styles/theme.scss`
- `packages/frontend-v5/src/providers/theme.tsx:118-135,153` (the active `<Global>`)
