# Resolve orphaned `constants/site.ts` (hardcoded name literals in v5 components)

- **Status:** ⚠️ drift risk / 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §6 Cross-cutting infra → Constants

## Context

`constants/site.ts` is **byte-identical** in v4 and v5 — but v5 components hardcode the site/author name
literals instead of importing these constants, so `constants/site.ts` is now **orphaned** for them:

- `Author.tsx:5,57` — name hardcoded `Kaede Hoshikawa` instead of `AUTHOR_NAME`.
- `Footer.tsx:44` — `SITE_NAME` replaced by a hardcoded literal (also a `FoooterContainer` typo class).
- `Header/Content.tsx` — `SITE_NAME` replaced by a literal.

(`__root.tsx` does import `SITE_NAME` for `og:site_name`, so the constant is not fully unused — but
the component-level literals create a drift risk: editing the constant won't update these.)

## Action

- [ ] Replace the hardcoded site/author literals in `Author.tsx`, `Footer.tsx`, and
  `Header/Content.tsx` with imports from `constants/site.ts` (`SITE_NAME` / `AUTHOR_NAME`).
- [ ] Fix the `FoooterContainer` typo class in `Footer.tsx` while touching it.
- [ ] Verify the displayed site/author names are unchanged after switching to the constants.

## References

- `packages/frontend-v5/src/constants/site.ts`
- `packages/frontend-v5/src/components/Author.tsx:5,57`
- `packages/frontend-v5/src/components/Footer.tsx:44`
- `packages/frontend-v5/src/components/Header/Content.tsx`
