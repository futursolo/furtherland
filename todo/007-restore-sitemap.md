# Restore the sitemap + its `<head>` `<link rel="sitemap">`

- **Status:** 🟠 MISSING
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #2; §5 Routes/Pages → Route TODOs
- **Split from:** the former combined RSS/robots/sitemap task; now split into `005`/`006`/`007`.

## Context

v4 generated its sitemap via the `@astrojs/sitemap` integration; v5 has **no** sitemap and **no**
replacement. The matching `<link rel="sitemap">` in the root `<head>` is also **absent** from the
v5 root `head()` (`__root.tsx:54-60`).

## Action

- [ ] Re-implement a sitemap in v5 (no v5 equivalent exists yet — e.g. a route that emits
  `sitemap.xml` from the post/page collections).
- [ ] Add `<link rel="sitemap">` to the v5 root `head()` in `__root.tsx:54-60`.
- [ ] Ensure `/robots.txt` (see `todo/006-restore-robots-txt.md`) references this sitemap URL.
- [ ] Run `yarn frontend-v5:generate-routes` after adding the new route file.

## References

- `packages/frontend-v5/src/routes/__root.tsx:54-60`
- v4 counterpart: `@astrojs/sitemap` integration (see `TODOs.md` §5)
- Related: `todo/006-restore-robots-txt.md` (its `Sitemap:` line points here)
