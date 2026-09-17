# Decide: heading-`id` generation for `H1`/`H2`/`H3` / anchor targets

- **Status:** 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §3 Elements → Element TODOs

## Context

Heading-`id` generation for `H1`/`H2`/`H3` and anchor targets is **not present** in either version.
It is a prerequisite for any TOC / anchor deep-linking (and for scroll-spy, see
`todo/013-decide-anchor-scrollspy.md`).

## Action (decide)

- [ ] Decide whether to generate stable `id`s for `H1`/`H2`/`H3` (and anchor targets) in v5.
- [ ] If yes, implement `id` generation in `elements/H1.tsx` / `H2.tsx` / `H3.tsx` (and `Anchor`).

## References

- `packages/frontend-v5/src/elements/H1.tsx`
- `packages/frontend-v5/src/elements/H2.tsx`
- `packages/frontend-v5/src/elements/H3.tsx`
- `packages/frontend-v5/src/elements/Anchor.tsx`
