# Fix `ThemeToggle` first-paint blank (currently `ClientOnly`-gated)

- **Status:** 🔴 GAP/BUG
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #7; §2 Components → `Nav` / `Nav/ThemeToggle`

## Context

In v5 the `ThemeToggle` is inlined in `Nav/index.tsx:48-65` and wrapped in `<ClientOnly>`
(`Nav/index.tsx:140-142`), so it renders `null` on the server → the theme toggle is **blank on first
paint**. v4 SSR-rendered the selected theme button (two-button markup with CSS showing one), so the
control was visible immediately.

Additional v5 drift from v4's `ThemeToggle.tsx`:
- two-button / CSS-visible-one → single reactive icon (via `useStore(themeAtom)`).
- the `navPosition` / `button-nav-fixed` Safari colour-fix was dropped (replaced by `color: inherit`).

## Action

- [ ] Make the theme toggle render on the server (first paint) to match v4 — e.g. SSR-render the
  current icon instead of gating the whole control behind `ClientOnly`.
- [ ] Decide whether the dropped `navPosition` / `button-nav-fixed` Safari colour-fix is still needed;
  restore it if so (currently handled only via `color: inherit`).

## References

- `packages/frontend-v5/src/components/Nav/index.tsx:48-65,140-142`
- `packages/frontend-v5/src/components/ClientOnly.tsx`
- v4 counterpart: `react/Nav/ThemeToggle.tsx` (see `TODOs.md` §2)
