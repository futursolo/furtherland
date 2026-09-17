# Fix home scroll button target (`nav` → `main`) and rename `scrollToMain`

- **Status:** 🔴 GAP/BUG
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #3; §2 Components → `HomeContent` / `ScrollButton`

## Context

On the home page the scroll-down button should scroll to the main content, but v5 targets the
wrong element. In v5 `HomeContent.tsx:48-54`, `scrollToMain` calls
`document.querySelector('nav')` and scrolls that into view — it should target `main`. The function
is also misnamed relative to what it does (it is named `scrollToMain` but scrolls `nav`).

v4 had a standalone `ScrollButton` island (targeting `main`); in v5 that island was removed and the
button inlined into `HomeContent.tsx`, and the target was changed `main` → `nav`.

## Action

- [ ] In `HomeContent.tsx` (`scrollToMain`, lines 48–54), change the selector from `nav` to `main`.
- [ ] Confirm the home scroll button now scrolls to the main content region, not the nav.

## References

- `packages/frontend-v5/src/components/Header/HomeContent.tsx:48-54`
- v4 counterparts: `react/ScrollButton/index.tsx`, `Header/HomeContent.astro` (see `TODOs.md` §2)
