# Restore `/robots.txt`

- **Status:** 🟠 MISSING
- **Priority:** high
- **Found in:** `TODOs.md` → Priority actions #2; §5 Routes/Pages → Route TODOs
- **Split from:** the former combined RSS/robots/sitemap task; now split into `005`/`006`/`007`.

## Context

v4 shipped `/robots.txt` via `pages/robots.txt.ts` — a GET route that (among other rules) references
the sitemap URL. v5 has **no** `/robots.txt` route.

## Action

- [ ] Re-implement `/robots.txt` in v5 (disallow rules + a `Sitemap:` line referencing the sitemap
  URL).
- [ ] Ensure the sitemap URL it references matches the sitemap route (see
  `todo/007-restore-sitemap.md`).
- [ ] Run `yarn frontend-v5:generate-routes` after adding the new route file.

## References

- v4 counterpart: `pages/robots.txt.ts` (see `TODOs.md` §5)
- Related: `todo/007-restore-sitemap.md` (the `Sitemap:` line points at it)
