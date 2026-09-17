# Consolidate the redundant runtime MDX `import()` in post/page routes

- **Status:** 🟡 DECIDE
- **Priority:** medium
- **Found in:** `TODOs.md` → §5 Routes/Pages → Route TODOs

## Context

`posts/$slug.tsx:50` / `pages/$slug.tsx:47` re-`import()` the MDX **by file path** even though the
entry's `Content` is already present in the **eager** build-time `import.meta.glob` map
(`content/posts.ts:40` / `content/pages.ts:37`). So there are two sources of truth for the compiled
MDX component; the route's runtime `import()` is redundant.

## Action

- [ ] Consolidate to a single source of truth: use the already-loaded `post.Content` /
  `page.Content` from the eager glob map instead of re-`import()`ing by file path in the route loader.
- [ ] Verify posts and pages still render correctly after removing the redundant import.

## References

- `packages/frontend-v5/src/routes/posts/$slug.tsx:50`
- `packages/frontend-v5/src/routes/pages/$slug.tsx:47`
- `packages/frontend-v5/src/content/posts.ts:40`
- `packages/frontend-v5/src/content/pages.ts:37`
