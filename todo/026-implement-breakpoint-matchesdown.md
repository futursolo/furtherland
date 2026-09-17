# Implement the empty `breakpoint.matchesDown()` stub

- **Status:** ⚠️ TODO stub / ⚪ CLEANUP
- **Priority:** medium
- **Found in:** `TODOs.md` → §6 Cross-cutting infra → Theme representation

## Context

`breakpoint.matchesDown()` is an **empty `// TODO` stub** at `providers/theme.tsx:30`. It is part of
the v5 JS theme object that replaces v4's SCSS breakpoint mixins. An empty stub means any consumer
calling `matchesDown()` gets no media query.

## Action

- [ ] Implement `breakpoint.matchesDown()` (mirror the v4 SCSS `mediaDown` mixin behaviour), or
  remove it if unused.
- [ ] Grep for callers of `matchesDown()` to confirm nothing depends on it while empty.

## References

- `packages/frontend-v5/src/providers/theme.tsx:30`
- v4 counterpart: breakpoint mixins in the v4 `theme.scss` partial
