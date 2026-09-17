# Fix stale comment in `PostComments`

- **Status:** ⚪ CLEANUP
- **Priority:** low
- **Found in:** `TODOs.md` → §2 Components → `PostComments`

## Context

The Giscus config itself is identical between v4 and v5, and the deferral moved from Astro
`client:visible` (v4 `PostLayout.astro:33`) to the layout's `<LazyOnly>` (`Post.tsx:31`). That
behavioral change is fine (🔵). However the comment at `PostComments.tsx:38-41` is **stale**: it
still claims an in-component `useIntersectionObserver` + SCSS approach that no longer matches the
current v5 implementation (which defers via `<LazyOnly>` in the layout, not via an in-component
observer).

## Action

- [ ] Update the comment at `PostComments.tsx:38-41` to describe the current deferral mechanism
  (`<LazyOnly>` in `Post.tsx`, not an in-component `useIntersectionObserver` + SCSS).

## References

- `packages/frontend-v5/src/components/PostComments.tsx:38-41`
- `packages/frontend-v5/src/layouts/Post.tsx:31`
- v4 counterpart: `react/PostComments/index.tsx`, `PostLayout.astro:33` (see `TODOs.md` §2)
