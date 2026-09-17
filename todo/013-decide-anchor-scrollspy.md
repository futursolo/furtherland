# Decide: add heading scroll-spy / active-TOC to `Anchor`?

- **Status:** 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §3 Elements → Element TODOs

## Context

`Anchor` (v4 `Mdx/Anchor.astro` → v5 `elements/Anchor.tsx`) is a styled `<a>` (primary color, bold,
hover-underline). **Neither version** has id generation, scrollspy, or active-TOC tracking (the v4
comment refers to a pre-v4 removed island). So this would be a **new feature**, not a regression.

## Action (decide)

- [ ] Decide whether v5 should *add* heading scroll-spy / active-TOC behaviour to `Anchor`.
- [ ] If yes, pair with heading-`id` generation (see `todo/014-decide-heading-id-generation.md`).

## References

- `packages/frontend-v5/src/elements/Anchor.tsx`
- v4 counterpart: `Mdx/Anchor.astro` (see `TODOs.md` §3)
