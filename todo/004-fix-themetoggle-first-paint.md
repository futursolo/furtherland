# Fix `ThemeToggle` first-paint blank (currently `ClientOnly`-gated)

- **Status:** ✅ Resolved (was 🔴 GAP/BUG)
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

- [x] Make the theme toggle render on the server (first paint) to match v4 — e.g. SSR-render the
  current icon instead of gating the whole control behind `ClientOnly`.
- [x] Decide whether the dropped `navPosition` / `button-nav-fixed` Safari colour-fix is still needed;
  restore it if so (currently handled only via `color: inherit`).

## Resolution (v5)

- Extracted the toggle into `Nav/ThemeToggle.tsx` and removed the `<ClientOnly>` wrapper in
  `Nav/index.tsx`, so both buttons are SSR-rendered and visible on first paint.
- Restored v4's two-button markup: the "Switch to Dark" (moon) and "Switch to Light" (sun) buttons
  both stay in the DOM, and CSS shows exactly one via `html[data-theme=...]`. The markup is static, so
  this avoids the SSR/client hydration mismatch the single-reactive-icon approach caused (the server
  always renders `light` while the client preload script may set `dark`); the pre-hydration
  `ThemePreloadScript` sets `data-theme` before first paint — no blank, no flash. Toggling only flips
  the `data-theme` attribute, so the component never re-renders.
- Safari colour-fix: kept `color: inherit` on the buttons — the inner `NavLayout` already applies the
  position-aware colour (white by default, the primary font colour once pinned to the top), so no
  separate `button-nav-fixed` class is needed.

Verified: `yarn lint` (Biome + `tsc`) passes; the production build/prerender emits both buttons in the
server HTML for every route.

## References

- `packages/frontend-v5/src/components/Nav/index.tsx:48-65,140-142`
- `packages/frontend-v5/src/components/ClientOnly.tsx`
- v4 counterpart: `react/Nav/ThemeToggle.tsx` (see `TODOs.md` §2)
