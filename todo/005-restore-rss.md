# Restore `/rss.xml` (RSS feed) + its `<head>` `<link rel="alternate">`

- **Status:** 🟠 MISSING
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #2; §5 Routes/Pages → Route TODOs
- **Split from:** the former combined RSS/robots/sitemap task; now split into `005`/`006`/`007`.

## Context

v4 shipped `/rss.xml` via `pages/rss.xml.ts` using `@astrojs/rss` — it **draft-filters**, orders
**newest-first**, and emits a **sanitized** markdown body. v5 has **no** `/rss.xml` route, and the
matching `<link rel="alternate" type="application/rss+xml">` is also **absent** from the v5 root
`head()` (`__root.tsx:54-60`).

## Action

- [ ] Re-implement `/rss.xml` in v5 (draft-filter + newest-first + sanitized body).
- [ ] Add `<link rel="alternate" type="application/rss+xml">` (pointing at `/rss.xml`) to the v5
  root `head()` in `__root.tsx:54-60`.
- [ ] Run `yarn frontend-v5:generate-routes` after adding the new route file.

## References

- `packages/frontend-v5/src/routes/__root.tsx:54-60`
- v4 counterpart: `pages/rss.xml.ts` (`@astrojs/rss`) (see `TODOs.md` §5)
- Related: `todo/010-restore-mdx-sanitization.md` (the RSS body sanitization step is also gone)
- Related: `todo/007-restore-sitemap.md` (sitemap is a separate task)
