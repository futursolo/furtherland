# Restore the `pointer:coarse` (touch) `+60px` bottom-bar extension

- **Status:** 🔴 GAP/BUG
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #4; §2 Components → `Header` / `HeaderBackground`

## Context

v4 extended the home bottom bar by `+60px` on coarse-pointer (touch) devices via
`@media (pointer:coarse)` rules in `Header/index.astro:59-77` (and the matching
`HeaderBackground.astro`). v5 dropped those rules: neither `Header/index.tsx` nor
`HeaderBackground.tsx` contains a `pointer:coarse` rule, so the mobile touch layout is missing the
extra bottom-bar space v4 provided.

## Action

- [ ] Re-add the `@media (pointer:coarse) { … +60px }` rule to v5 `Header/index.tsx`
  (mirroring v4 `Header/index.astro:59-77`).
- [ ] Re-add the matching coarse rule to v5 `HeaderBackground.tsx` if v4 had one there.
- [ ] Verify the home bottom bar gains the `+60px` extension on touch devices.

## References

- `packages/frontend-v5/src/components/Header/index.tsx` (no coarse rule present)
- `packages/frontend-v5/src/components/Header/HeaderBackground.tsx` (no coarse rule present)
- v4 counterpart: `Header/index.astro:59-77` (see `TODOs.md` §2)
