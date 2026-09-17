# Resolve theme-atom drift (two divergent copies)

- **Status:** ⚠️ drift risk / ⚪ CLEANUP
- **Priority:** medium
- **Found in:** `TODOs.md` → §6 Cross-cutting infra → Theme atom

## Context

v4's `atoms/theme.ts` was a 1-line re-export of `@@common/atoms/theme`. In v5 the
`@furtherland/common` dependency + `@@common` alias were **removed** and the atom was **inlined** as
a verbatim local copy (`atoms/theme.tsx`). The logic is currently identical (`fl_theme` key, 6h
expiry, system-preference fallback) — but now there are **two copies that can diverge**.

## Action

- [ ] Decide how to keep a single source of truth for the theme atom (re-introduce a shared
  `common` module, or formally accept the v5 local copy as the sole owner).
- [ ] Prevent the two copies from drifting (delete the v4 re-export path if v4 is being retired, or
  re-share the module).

## References

- `packages/frontend-v5/src/atoms/theme.tsx`
- v4 counterpart: `@@frontend/atoms/theme.ts` (re-export of `@@common/atoms/theme`)
