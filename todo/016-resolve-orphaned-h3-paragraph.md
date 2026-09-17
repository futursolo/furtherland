# Resolve orphaned `H3` + `Paragraph` element components

- **Status:** ⚪ CLEANUP (and 🟡 wire-vs-delete)
- **Priority:** medium
- **Found in:** `TODOs.md` → §3 Elements → Element TODOs

## Context

Two element components are **orphaned in both v4 and v5** — defined and exported, but not in the MDX
`components` map and never rendered:

- `H3` — MDX `###` renders a native `<h3>` in both; the `elements/H3.tsx` override is never applied.
- `Paragraph` — its `2rem` line-height is not applied to MDX `p` in either version (not in the map).

The MDX element-override coverage is otherwise 1:1 identical between v4 and v5 (posts use
`{ a: Anchor, pre: Pre, table: Table }`, pages use `{ a: Anchor, pre: Pre }`).

## Action (decide)

- [ ] For each of `H3` and `Paragraph`: either **wire** it into the MDX `components` map (so MDX
  `h3` / `p` get the intended styling) or **delete** the dead component.

## References

- `packages/frontend-v5/src/elements/H3.tsx`
- `packages/frontend-v5/src/elements/Paragraph.tsx`
- `packages/frontend-v5/src/elements/index.tsx` (barrel)
- MDX `components` map: where v5 compiles MDX (see `TODOs.md` §3)
