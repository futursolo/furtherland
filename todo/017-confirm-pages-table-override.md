# Confirm `Table` override coverage for `pages`

- **Status:** 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §3 Elements → Element TODOs

## Context

`Table` (v4 `Mdx/Table.astro` → v5 `elements/Table.tsx`) provides a horizontal-scroll wrapper, but it
is only overridden for **posts**, not `pages`, in either version. (The light/dark palette gating
differs mechanically — v4 gates light behind `html[data-theme=light]`, v5 treats light as the
implicit base — but the net output is identical, so that part is 🔵.)

## Action (decide)

- [ ] Confirm whether `pages` content ever contains wide tables that would need the `Table`
  horizontal-scroll override.
- [ ] If yes, add `table: Table` to the pages MDX `components` map; if no, document that pages are
  intentionally excluded.

## References

- `packages/frontend-v5/src/elements/Table.tsx`
- MDX `components` map for pages (see `TODOs.md` §3, §5)
