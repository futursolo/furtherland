# Decide invalid-frontmatter behavior (v4 throws vs v5 silently skips)

- **Status:** 🔵/🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §6 Cross-cutting infra → Content config

## Context

For invalid frontmatter: v4 (Astro `glob` loader + zod) **throws at build** on invalid frontmatter.
v5 splits into `content/posts.ts` + `content/pages.ts` + `content/types.ts`, using zod
`safeParse` and **silently skipping** invalid entries — so the build no longer fails on bad
frontmatter. (The zod schemas themselves are field-for-field identical, and draft visibility at the
summary level matches — that part is 🔵.)

## Action (decide)

- [ ] Decide the desired behavior for invalid frontmatter in v5: keep silent-skip, or fail the build
  (matching v4).
- [ ] Apply: surface a build error/warning on `safeParse` failure if v4 parity is wanted.

## References

- `packages/frontend-v5/src/content/posts.ts`
- `packages/frontend-v5/src/content/pages.ts`
- `packages/frontend-v5/src/content/types.ts`
