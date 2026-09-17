# Resolve `styles.css` dead code (new design system imported nowhere)

- **Status:** 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → Priority actions #5; §6 Cross-cutting infra

## Context

v5's `styles.css` is a **brand-new design system** (Google Fonts, a `--sea-ink`/`--lagoon`/…
palette, `.nav-link`, `.demo-*`, animations), and **none of v4's rules are in it**. It is imported
by **no module in v5** → it is dead code that never reaches the build. v5's actual runtime globals
are only the `ThemeProvider` `<Global>` (v4-era values).

If it were wired in, it would **conflict** with the `ThemeProvider` `<Global>` `body` rules (two
`font-family` / `background` / `color` declarations).

## Action (decide)

- [ ] Decide: (a) wire `styles.css` into the build — and resolve the conflicting `body`
  `font-family`/`background`/`color` rules against the `ThemeProvider` `<Global>`; **or**
  (b) delete `styles.css` as dead code.
- [ ] Apply the chosen option.

## References

- `packages/frontend-v5/src/styles.css`
- `packages/frontend-v5/src/providers/theme.tsx:118-135,153` (the `<Global>` it would conflict with)
- v4 counterpart: `@@frontend/styles/globalStyles.scss` (see `TODOs.md` §6)
