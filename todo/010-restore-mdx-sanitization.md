# Restore MDX sanitization (dropped in v5)

- **Status:** 🟠 MISSING
- **Priority:** high
- **Found in:** `TODOs.md` → §6 Cross-cutting infra → Content config

## Context

v4's content pipeline ran `@astrojs/markdown-satteri` + `markdown-it` + `sanitize-html`, sanitizing
MDX output. v5 compiles MDX straight to React (`@mdx-js/rollup`) with **no sanitization step**, so
raw/untrusted MDX content is no longer sanitized before rendering.

## Action

- [ ] Add a sanitization step to the v5 MDX pipeline (or confirm all content is trusted/first-party
  and document the decision to skip sanitization).
- [ ] If re-adding, wire a sanitizer into the v5 MDX compilation (e.g. a remark/rehype
  sanitization plugin) and re-enable it for the RSS body too (see
  `todo/005-restore-rss.md`).

## References

- v4 pipeline: `@astrojs/markdown-satteri` + `markdown-it` + `sanitize-html`
- v5 pipeline: `@mdx-js/rollup` in `packages/frontend-v5/vite.config.ts`
