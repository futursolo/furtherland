# v5 Migration TODOs

Individual, actionable tasks split out of [`TODOs.md`](../TODOs.md) — the behavioral-difference
audit of `frontend` (v4, Astro) vs `frontend-v5` (v5, TanStack Start). Each file is one task with a
status tag, the context, a concrete action, and `file:line` references.

**Status tags** (from `TODOs.md`)
- 🔴 **GAP/BUG** — v5 behaves differently / is broken; fix to match v4.
- 🟠 **MISSING** — v4 behavior with no v5 counterpart; (re)implement.
- 🟡 **DECIDE** — ambiguous; a keep/replace/delete decision is needed.
- ⚪ **CLEANUP** — dead/stale code in v5.
- ⚠️ **drift risk** — currently identical, but a change invites the two to diverge.

🔵 **NOTE** items (intentional framework changes, aware-only, no action) are deliberately **not**
split into tasks.

## Numbering follows the recommended order

Tasks are numbered so that **each contiguous range is one coherent, mostly-independent work-stream**
(regressions → hard gaps → decisions → cleanup). That lets you hand out number ranges to agents
working in parallel — see [Distribution](#distribute-across-agents).

## Index

### 🔴 Regressions (001–004) — fix to match v4
| # | File | Status | Priority | Summary |
|---|------|--------|----------|---------|
| 001 | [`001-fix-home-header-background-height.md`](./001-fix-home-header-background-height.md) | 🔴 | high | Home hero background stuck at 300px (`is-home` vs `currently-home` mismatch) |
| 002 | [`002-fix-home-scroll-button-target.md`](./002-fix-home-scroll-button-target.md) | 🔴 | high | Home scroll button targets `nav` not `main`; misnamed `scrollToMain` |
| 003 | [`003-restore-pointer-coarse-extension.md`](./003-restore-pointer-coarse-extension.md) | 🔴 | high | `pointer:coarse` (touch) `+60px` bottom-bar extension dropped |
| 004 | [`004-fix-themetoggle-first-paint.md`](./004-fix-themetoggle-first-paint.md) | 🔴 | high | `ThemeToggle` `ClientOnly`-gated → blank on first paint |

### 🟠 Hard gaps (005–010) — (re)implement missing v4 behavior
| # | File | Status | Priority | Summary |
|---|------|--------|----------|---------|
| 005 | [`005-restore-rss.md`](./005-restore-rss.md) | 🟠 | high | Restore `/rss.xml` + `<link rel="alternate">` |
| 006 | [`006-restore-robots-txt.md`](./006-restore-robots-txt.md) | 🟠 | high | Restore `/robots.txt` |
| 007 | [`007-restore-sitemap.md`](./007-restore-sitemap.md) | 🟠 | high | Restore `/sitemap` + `<link rel="sitemap">` |
| 008 | [`008-migrate-shared-mdx-client-only.md`](./008-migrate-shared-mdx-client-only.md) | 🟠 | high | Shared MDX `client:only="react"` → v5 `ClientOnly`/`LazyOnly` |
| 009 | [`009-decide-fl-contents-dir-override.md`](./009-decide-fl-contents-dir-override.md) | 🟠 | high | `FL_CONTENTS_DIR` override dropped — carry over? |
| 010 | [`010-restore-mdx-sanitization.md`](./010-restore-mdx-sanitization.md) | 🟠 | high | MDX sanitization dropped in v5 |

### 🟡/🔵 Decisions (011–021) — need a keep/replace/delete call, then implement
| # | File | Status | Priority | Summary |
|---|------|--------|----------|---------|
| 011 | [`011-resolve-styles-css-dead-code.md`](./011-resolve-styles-css-dead-code.md) | 🟡 | medium | `styles.css` (new design system) imported nowhere — wire or delete |
| 012 | [`012-decide-deployment-prerender.md`](./012-decide-deployment-prerender.md) | 🔵/🟠 | high | Static prerender → on-demand SSR; decide SSR Workers vs prerender |
| 013 | [`013-decide-anchor-scrollspy.md`](./013-decide-anchor-scrollspy.md) | 🟡 | medium | Add heading scroll-spy / active-TOC to `Anchor`? (new feature) |
| 014 | [`014-decide-heading-id-generation.md`](./014-decide-heading-id-generation.md) | 🟡 | medium | Heading-`id` generation for `H1`/`H2`/`H3` / anchor targets |
| 015 | [`015-decide-pre-copy-to-clipboard.md`](./015-decide-pre-copy-to-clipboard.md) | 🟡 | medium | Add copy-to-clipboard button to `Pre`? (new feature) |
| 016 | [`016-resolve-orphaned-h3-paragraph.md`](./016-resolve-orphaned-h3-paragraph.md) | ⚪/🟡 | medium | Orphaned `H3` + `Paragraph` — wire into MDX map or delete |
| 017 | [`017-confirm-pages-table-override.md`](./017-confirm-pages-table-override.md) | 🟡 | medium | Confirm `Table` override coverage for `pages` |
| 018 | [`018-decide-404-route.md`](./018-decide-404-route.md) | 🟡 | medium | 404 route decision + restore `noindex` robots meta |
| 019 | [`019-decide-about-route.md`](./019-decide-about-route.md) | 🟡 | medium | `/about` — hardcoded starter vs content-driven page |
| 020 | [`020-consolidate-mdx-import.md`](./020-consolidate-mdx-import.md) | 🟡 | medium | Redundant runtime MDX `import()` in post/page routes |
| 021 | [`021-decide-invalid-frontmatter-behavior.md`](./021-decide-invalid-frontmatter-behavior.md) | 🔵/🟡 | medium | Invalid frontmatter: v4 throws vs v5 silently skips |

### ⚪/⚠️ Cleanup (022–027) — dead code + drift risk
| # | File | Status | Priority | Summary |
|---|------|--------|----------|---------|
| 022 | [`022-fix-postcomments-stale-comment.md`](./022-fix-postcomments-stale-comment.md) | ⚪ | low | Stale comment in `PostComments` (claims removed in-component observer) |
| 023 | [`023-resolve-theme-atom-drift.md`](./023-resolve-theme-atom-drift.md) | ⚠️/⚪ | medium | Theme atom inlined → two copies can diverge |
| 024 | [`024-remove-unused-theme-scss.md`](./024-remove-unused-theme-scss.md) | ⚪ | low | Unused `styles/theme.scss` (stale v4/Astro comments) |
| 025 | [`025-review-theme-object-minor-diffs.md`](./025-review-theme-object-minor-diffs.md) | ⚪/🔵 | low | `fontSizes` ladder + extra generic `sans-serif` |
| 026 | [`026-implement-breakpoint-matchesdown.md`](./026-implement-breakpoint-matchesdown.md) | ⚠️/⚪ | medium | Empty `breakpoint.matchesDown()` `// TODO` stub |
| 027 | [`027-resolve-orphaned-site-constants.md`](./027-resolve-orphaned-site-constants.md) | ⚠️/🟡 | medium | `constants/site.ts` orphaned — components hardcode name literals |

## Distribute across agents

Because the numbering follows the recommended order, contiguous ranges are self-contained
work-streams. Pick a split:

| Agent | Range | Tasks | Can start now? |
|-------|-------|-------|----------------|
| A | **001–010** | all 🔴 regressions + all 🟠 hard gaps (10 concrete fixes) | ✅ yes — no open decisions |
| B | **011–021** | 🟡/🔵 decisions (11) | ⏳ decision-gated — draft the options, implement after you decide |
| C | **022–027** | ⚪/⚠️ cleanup (6 low-risk tidy-ups) | ✅ yes — no open decisions |

- **Two agents:** A → `001–013`, B → `014–027` (balanced ~14/13). Or, cleaner: A → `001–010`
  (do the concrete fixes now), B → `022–027` (do cleanup now) **and** B drafts the `011–021`
  decision briefs for you; the `011–021` implementation follows once you rule on the decisions.
- **Three agents (recommended):** one per range above — A, B, C. A and C proceed immediately; B
  produces the decision list, and everyone picks up the `011–021` implementation after the
  decisions are made.

Within each range, individual tasks are independent (a few cross-references link related tasks, e.g.
`005↔010`, `006↔007`, `013↔014`), so a single agent may take a whole range without blocking the others.
