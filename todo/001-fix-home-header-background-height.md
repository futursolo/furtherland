# Fix home hero background height (class mismatch)

- **Status:** 🔴 GAP/BUG
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #1; §2 Components → `HeaderBackground`

## Context

The v5 home hero background does not fill the viewport on desktop. `HeaderBackground.tsx:38`
applies `className="is-home"` to the `Layout`, and the base rule `&.is-home { height: 100vh }`
(lines 13–15) matches it. But the `md-up` override (lines 20–22) targets `&.currently-home` — a
class that is **never applied**. So on `md+` the media block sets `height: 300px` (line 18) and the
`100vh` override never fires → the desktop home hero background is stuck at 300px instead of filling
the viewport. v4 (`HeaderBackground.astro`) kept `100lvh` for `.is-home` at all breakpoints.

## Action

- [ ] In `HeaderBackground.tsx`, change the `md-up` override (lines 20–22) from `&.currently-home`
  to `&.is-home` — consistent with `Header/index.tsx:28`, which already does this correctly.
- [ ] Verify on a `md+` viewport that the home hero background fills `100vh` (matches v4).

## References

- `packages/frontend-v5/src/components/Header/HeaderBackground.tsx:13-15,18,20-22,38`
- `packages/frontend-v5/src/components/Header/index.tsx:28`
- v4 counterpart: `HeaderBackground.astro` (see `TODOs.md` §2)
