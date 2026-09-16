# Behavioral differences: `frontend` (v4, Astro) vs `frontend-v5` (v5, TanStack Start)

Comparison of **components, elements, layouts and pages** (plus the cross-cutting infra that
drives their behavior) between the two frontend workspaces. Every finding is tagged with a
status and cites `file:line`. Values (theme colours, breakpoints, Giscus config, content
schema, site constants) are value-for-value identical across both — the differences below are
about **how** behavior is delivered, and about genuine gaps/bugs/regressions in `v5`.

**Status tags**
- 🔴 **GAP/BUG** — v5 behaves differently (or is broken); should be fixed to match v4.
- 🟠 **MISSING** — behavior present in v4 has no v5 counterpart; must be (re)implemented.
- 🟡 **DECIDE** — ambiguous; a decision is needed (keep / replace / delete).
- ⚪ **CLEANUP** — dead/stale code in v5.
- 🔵 **NOTE** — intentional framework change; aware-only, no action.

---

## Priority actions (the real regressions / hard gaps)

| # | Item | Tag | Impact |
|---|------|-----|--------|
| 1 | Home header background stuck at 300px on desktop (`is-home` vs `currently-home` class mismatch) | 🔴 | Visual — home hero does not fill viewport on md+ |
| 2 | `/rss.xml`, `/robots.txt`, `/sitemap` and their `<head>` `<link>`s all gone | 🟠 | SEO / feeds |
| 3 | Home scroll button targets `nav`, not `main` (and is misnamed `scrollToMain`) | 🔴 | UX on home |
| 4 | `pointer:coarse` (touch) `+60px` bottom-bar extension dropped | 🔴 | Mobile touch layout |
| 5 | `styles.css` (a whole new design system) is imported nowhere — dead code, and would conflict if wired | 🟡 | Build/cleanliness |
| 6 | Shared MDX uses Astro `client:only="react"`; v5's mdx-js ignores it → charts would SSR | 🟠 | Content (draft `test.mdx`) |
| 7 | ThemeToggle is `ClientOnly`-gated → blank on first paint (v4 SSR-rendered the button) | 🔴 | First paint / a11y |
| 8 | Static prerender (v4) → on-demand SSR (v5) with no prerender configured | 🔵/🟠 | Deployment model (Cloudflare Pages) |

Detailed breakdown below.

---

## 1. Framework / architecture shift (context for everything else)

🔵 **Astro (static) → TanStack Start (SSR).** `frontend` builds with `output: 'static'`
(`packages/frontend/astro.config.ts:35`) and prerenders every route to static files under
`build/client`. `frontend-v5` uses Vite + `tanstackStart()` with **no prerender configured**
(`packages/frontend-v5/vite.config.ts`), so it ships a Start SSR server + client assets and
renders routes on demand.

Consequences that ripple through the rest of this doc:
- 🔵 Route data: Astro `getStaticPaths` + `getCollection` + `render(entry)` → TanStack
  **router `loader`** + build-time `import.meta.glob` map + runtime `import()` of the MDX.
- 🟠 **Deployment:** the root AGENTS.md deploys to **Cloudflare Pages**. v4's static output
  deploys trivially; v5 (SSR, no prerender) needs the TanStack Start Cloudflare adapter —
  a plain static Pages deploy of v5 would not run the SSR server. Decide whether to (a) deploy
  as SSR Workers, or (b) configure Start **prerender** for the post/page families to recover v4 behavior.
- 🔵 Client runtime: Astro `<ClientRouter/>` (view transitions) → TanStack `<Scripts/>`.
- 🔵 MDX pipeline: `@astrojs/mdx` → `@mdx-js/rollup`; Shiki dual-theme is preserved
  (`github-light`/`github-dark`) via Astro `markdown.shikiConfig` → `@shikijs/rehype`.

---

## 2. Components

Mapping: `components/*.astro` → `components/*.tsx`; `components/react/*` → `components/*`
(flattened) or inlined. New v5 primitives: `ClientOnly`, `LazyOnly`, `FlexSpace`, barrel
`index.tsx`.

| Component | v4 | v5 | Behavior diff | Tag |
|-----------|----|----|---------------|-----|
| `Author` | `Author.astro` | `Author.tsx` | Name now hardcoded `Kaede Hoshikawa` instead of `AUTHOR_NAME` (`Author.tsx:5,57`); `.author-right` height 60→50px (`Author.tsx:32`). Values otherwise same. | 🔵 (drift risk if name changes) |
| `Box` | `Box.astro` (slot + `class:list` merge) | `Box.tsx` (Emotion `styled.div` + `children`) | slot→children, SCSS→Emotion; base flex styles same | 🔵 |
| `Footer` | `Footer.astro` | `Footer.tsx` | `SITE_NAME` → hardcoded literal (`Footer.tsx:44`); typo class `FoooterContainer` | 🔵 |
| `Link` | `Link.astro` | `Link.tsx` | `class:list`→React; color var same (`--fl-theme-main-colour-primary`); both a plain themed `<a>` | 🔵 |
| `Main` | `Main.astro` (had `isHome` prop → `.home-main` min-height) | `Main.tsx` | **`isHome` prop removed**; home min-height now applied by caller via inline `style` (`layouts/Home.tsx:61`) | 🔵 (API changed) |
| `MainContainer` | `MainContainer.astro` (own file) | co-located `styled.div` in `Main.tsx:21`, re-exported from barrel | file location changed; box rules same | 🔵 |
| `ThemePreloadScript` | `ThemePreloadScript.astro` (`<script is:inline>`) | `ThemePreloadScript.tsx` (`dangerouslySetInnerHTML`) | identical IIFE + same `<head>` placement; mechanism changed | 🔵 |
| `Header` (index) | `Header/index.astro` | `Header/index.tsx` | (a) `100lvh`→`100vh` for `is-home`; (b) **`@media (pointer:coarse){ +60px }` dropped** (`index.tsx` has no coarse rule, v4 `index.astro:59-77`); (c) `Nav` is plain SSR (v4 whole-Nav was a `client:load` island) | 🔴 #4 |
| `Header/Content` | `Content.astro` | `Content.tsx` | `SITE_NAME`→literal; breakpoints via `theme.breakpoint.*.mediaDown()`; geometry same | 🔵 |
| `Header/HeaderBackground` | `HeaderBackground.astro` | `HeaderBackground.tsx` | **class mismatch bug** (see below); `100lvh`→`100vh`; `pointer:coarse +60px` dropped; Astro `Asset.src`→Vite default import | 🔴 #1, #4 |
| `Header/HomeContent` | `HomeContent.astro` (separate `ScrollButton` island) | `HomeContent.tsx` (scroll button inlined) | standalone `ScrollButton` island removed → inlined; **scroll target `main`→`nav`** (`HomeContent.tsx:49`), fn misnamed `scrollToMain` | 🔴 #3 |
| `Nav` (index) | `react/Nav/index.tsx` | `Nav/index.tsx` | top-state CSS class → inline `useTheme` style; links `data-astro-reload` → plain `<a href>` (both full-reload, net same); outer safe-area padding no longer zeroed; `ThemeToggle` now `ClientOnly` (see below) | 🔵 + 🔴 #8 |
| `Nav/LinkItem` | `LinkItem.tsx` (+`LinkItem.module.scss`) | `LinkItem.tsx` (Emotion) | hover-to-fill indicator reproduced (selector `.indicator`→`'.nav-link-item-indicator'`); behavior same | 🔵 |
| `Nav/ThemeToggle` | `ThemeToggle.tsx` (two buttons, CSS shows one; `navPosition` prop for a Safari color-fix) | inlined in `Nav/index.tsx:36-64` (single icon, reactive via `useStore(themeAtom)`, `ClientOnly`-gated) | two-button/CSS-visible → single reactive icon; **absent in SSR** (first-paint blank) vs v4 which SSR-rendered the selected button; `navPosition`/`button-nav-fixed` Safari-fix dropped (replaced by `color:inherit`) | 🔴 #8 |
| `PostComments` | `react/PostComments/index.tsx` | `PostComments.tsx` | Giscus config identical; deferral moved from Astro `client:visible` (v4 `PostLayout.astro:33`) → layout `<LazyOnly>` (`Post.tsx:31`); v5 comment `PostComments.tsx:38-41` is stale (claims in-component `useIntersectionObserver` + SCSS) | ⚪ fix comment |
| `ScrollButton` | `react/ScrollButton/index.tsx` (standalone island) | **no v5 file** — inlined in `HomeContent.tsx` | see `HomeContent` row | 🔴 #3 |
| `SyncTheme` | `react/SyncTheme.tsx` (`client:only` island) | **no v5 component** — both effects absorbed into `ThemeProvider` (`providers/theme.tsx:143-149`) | behavior preserved; just relocated | 🔵 |
| `ClientOnly` | — (Astro `client:only`) | `ClientOnly.tsx` | **new primitive**; renders `null` in SSR. ⚠️ ≈ `client:only` (hidden on server), **not** `client:load` (which SSR-renders). Anything wrapped is absent from first paint. | 🔵 |
| `LazyOnly` | — (Astro `client:visible`) | `LazyOnly.tsx` | **new primitive**; zero-height sentinel, renders children only when intersecting (200px pre-trigger + freeze) | 🔵 |
| `FlexSpace` | — (ad-hoc `.flex-space` classes) | `FlexSpace.tsx` | **new shared component** for the `flex:1` spacer (v4 had it only as CSS) | 🔵 |
| `components/index.tsx` (barrel) | — (pages imported files directly) | new barrel | re-exports most; **intentionally omits `Nav`/`PostComments`** (direct-imported for bundle isolation) | 🔵 |

### 🔴 #1 — `HeaderBackground` class mismatch (headline visual bug)
`HeaderBackground.tsx:38` sets `className="is-home"` on the `Layout`, and the base rule
`&.is-home { height:100vh }` (`:13-15`) matches. **But** the `md-up` override targets
`&.currently-home` (`:20-22`), a class that is **never applied**. On md+ the media block
sets `height:300px` (`:18`) and the `100vh` override never fires → **the desktop home hero
background is stuck at 300px** instead of filling the viewport (v4 `HeaderBackground.astro`
kept `100lvh` for `.is-home` at all breakpoints). **Fix:** make the `md-up` override use
`&.is-home` (consistent with `Header/index.tsx:28`, which does this correctly).

---

## 3. Elements (MDX block components)

Mapping: `components/Mdx/*` + `components/H1.astro`/`H2.astro` → `elements/*`.

**Key finding:** the MDX element-override **coverage is 1:1 identical** between v4 and v5 —
posts use `{ a: Anchor, pre: Pre, table: Table }`, pages use `{ a: Anchor, pre: Pre }`, and
`h1/h2/h3/p` are *not* in the MDX map in either version. No element was dropped from the map.

| Element | v4 | v5 | Behavior diff | Tag |
|---------|----|----|---------------|-----|
| `Anchor` | `Mdx/Anchor.astro` | `elements/Anchor.tsx` | styled `<a>` (primary color, bold, hover-underline). **No id generation / scrollspy / active tracking in either** (v4 comment refers to a pre-v4 removed island). | ⚪/🟡 both |
| `H1` | `H1.astro` | `elements/H1.tsx` | layout title (Post/Page layouts), not an MDX element; `3rem`. v4 had `transition:name` (dropped in v5). | 🔵 |
| `H2` | `H2.astro` | `elements/H2.tsx` | home post-card title, `2rem`; v4 `transition:name` dropped. | 🔵 |
| `H3` | `Mdx/H3.astro` | `elements/H3.tsx` | **orphaned in both** — defined + exported but not in the MDX map and never rendered. MDX `###` renders a native `<h3>` in both. | ⚪/🟡 |
| `Paragraph` | `Mdx/Paragraph.astro` | `elements/Paragraph.tsx` | **orphaned in both** — the `2rem` line-height is not applied to MDX `p` in either (not in the map). | ⚪/🟡 |
| `Pre` | `Mdx/Pre.astro` | `elements/Pre.tsx` | Shiki dual `github-light/dark` same; **no copy-to-clipboard button in either** (v4 comment hints it was removed earlier). | ⚪/🟡 |
| `Table` | `Mdx/Table.astro` | `elements/Table.tsx` | horizontal-scroll wrapper same (**posts only**, not pages). v4 gates the *light* palette behind `html[data-theme=light]`; v5 treats light as the implicit base and dark as a conditional override — net-identical output. | 🔵 |

**Element TODOs**
- 🟡 `Anchor` — decide whether v5 should *add* heading scroll-spy / active-TOC (a **new feature**;
  absent from the current v4 tree too, so not a regression).
- 🟡 Heading-`id` generation for `H1/H2/H3`/anchor targets — needed for any TOC/anchor deep-links.
- 🟡 `Pre` copy-to-clipboard button — decide whether to *add* (new feature; absent in v4 too).
- ⚪ `H3` + `Paragraph` are dead code in both — either wire them into the MDX `components` map
  (so MDX `h3`/`p` get the intended styling) or delete them.
- 🟡 `Table` is not overridden for `pages` in either version — confirm pages never contain wide tables.

Cross-checked: SCSS `:global`/`fl-mdx-table` (v4) vs Emotion `&` (v5) is a mechanism-only change, same visual output.

---

## 4. Layouts

Mapping (by content, not name):

| v4 (Astro) | v5 (React) | Relationship |
|------------|-----------|--------------|
| `layouts/BaseLayout.astro` (document shell: `<html>/<head>/<body>` + preload + head meta + `ClientRouter`) | **`routes/__root.tsx`** → `RootDocument` (`shellComponent`) + route `head()` + `Providers` | document role split across `__root.tsx` + `head()` + `providers/` |
| `layouts/RootLayout.astro` (`SyncTheme client:only` + Box + Header + Footer) | `layouts/Root.tsx` (`Box`+Header+children+Footer); `SyncTheme` absorbed into `ThemeProvider` | chrome wrapper 1:1, minus `SyncTheme` |
| `layouts/PageLayout.astro` | `layouts/Page.tsx` | 1:1 |
| `layouts/PostLayout.astro` | `layouts/Post.tsx` | 1:1 |
| — (v4 had no home layout) | **new** `layouts/Home.tsx` | promotes v4 `index.astro`'s post-list markup into a reusable layout |

| Area | v4 | v5 | Tag |
|------|----|----|-----|
| Root `<title>` | `BaseLayout.astro:29` always renders `<title>` (default `SITE_NAME`) | no root title; only routes that set `head().title` get one | 🔵 |
| RSS `<link rel=alternate>` | `BaseLayout.astro:30-35` | **absent** from v5 root `head()` (`__root.tsx:54-60`) | 🟠 #2 |
| Sitemap `<link rel=sitemap>` | `BaseLayout.astro:36` | **absent** | 🟠 #2 |
| `og:site_name` placement | per-page | hoisted to root `head()` (`__root.tsx:58`); net equivalent | 🔵 |
| Global `--fl-theme-*` vars + `html,body` base | static `import '@@frontend/styles/globalStyles.scss'` (`BaseLayout.astro:12`) | Emotion `<Global>` inside `ThemeProvider` (`providers/theme.tsx:118-135,153`) | 🔵 (value-for-value same) |
| `<html>` hydration | `<html lang="en">` | `<html lang="en" suppressHydrationWarning>` (`__root.tsx:68`) | 🔵 |
| Theme provider / `data-theme` sync | `SyncTheme client:only` island (body) + head SCSS | `ThemeProvider` (server+client) in `Providers`; `SyncTheme` component gone | 🔵 |
| `<ClientRouter/>` (view transitions) | `BaseLayout.astro:38` | none; replaced by `<Scripts/>` (`__root.tsx:79`) — **all view-transition behavior dropped** | 🔵 |
| `transition:name` (Post H1/Author; Home H2/Author) | present | **removed** (no Astro view transitions) | 🔵 |
| Post comments deferral | Astro `client:visible` (markup in initial HTML, hydrate-when-visible) | `<LazyOnly>` (markup **absent** pre-intersection, render-when-visible) | 🔵 (semantics shifted) |
| `pageTitle`/`head`-slot threading | page→layout→BaseLayout slot chain | gone; declarative route `head()` replaces it | 🔵 |
| `<TanStackDevtools>` | — | `__root.tsx:75-78` (dev) | 🔵 |

Home layout is the only non-1:1: v4 inlined the post list in `index.astro`; v5 promotes it to
`layouts/Home.tsx`, and `Main`'s `isHome`/`.home-main` class becomes an inline `minHeight`
style on `<Main>` (`Home.tsx:60-67`). Net content (linked `H2` titles + `Author` byline) is equivalent.

---

## 5. Routes / Pages

| Route | v4 | v5 | Tag |
|-------|----|----|-----|
| `/` (home) | `pages/index.astro` (static, `getCollection`, all posts, newest-first, drafts hidden in prod) | `routes/index.tsx` + `layouts/Home.tsx` (SSR, `getPostSummaries()` — same list/order/draft rule) | 🔵 (mechanism changed, output same) |
| `/posts/<slug>` | `posts/[slug].astro` — `getStaticPaths` expands one **static** path per non-draft post; `render(entry)` | `posts/$slug.tsx` — **one** dynamic route, `loader` → `getPost(slug)` → `notFound()` if missing/draft-in-prod, then runtime `import()` of the MDX; **on-demand SSR** | 🔵 + 🟠 (see deploy) |
| `/pages/<slug>` | `pages/[slug].astro` — same pattern | `pages/$slug.tsx` — same pattern | 🔵 + 🟠 |
| `/404` | dedicated `pages/404.astro` (+ `<meta name=robots content=noindex>`) | **no route file**; root `notFoundComponent` (`__root.tsx:12-30,61`) doubles as the not-found handler for loader `notFound()` | 🟡 |
| `/about` | none at top level (About was only `/pages/about` via MDX) | **new** `routes/about.tsx` — a **hardcoded TanStack starter** (see below) | 🟡 #below |
| `/robots.txt` | `pages/robots.txt.ts` (GET, references sitemap) | **absent** | 🟠 #2 |
| `/rss.xml` | `pages/rss.xml.ts` (`@astrojs/rss`: draft-filter + newest-first + **sanitized** markdown body) | **absent** | 🟠 #2 |
| `/sitemap*.xml` | `@astrojs/sitemap` integration | **absent** (no v5 replacement) | 🟠 #2 |

**Route TODOs**
- 🟠 #2 **Re-implement `/rss.xml`** (draft-filter + newest-first + sanitized body), **`/robots.txt`**,
  and a **sitemap** — then add the RSS/sitemap `<link>`s back to the v5 root `head()`
  (`__root.tsx:54-60`). This is the largest hard content/SEO gap.
- 🟡 **404** — decide if the root `notFoundComponent` suffices or add a dedicated route;
  **restore the `noindex` robots meta** that v4's `404.astro:11` had (v5 sets none).
- 🟡 **`/about`** — v5's `routes/about.tsx` is a hardcoded starter (uses Tailwind classes
  `page-wrap`/`island-shell` and an undefined `--sea-ink` var; bypasses the `Page` layout and
  `ThemeProvider`) and **coexists** with the content-driven `/pages/about` (published
  `packages/contents/src/pages/about.mdx`). Decide: (a) keep both, (b) delete the starter, or
  (c) make `/about` render the `about.mdx` content.
- 🟠 **Shared MDX `client:only` leakage** — shared posts (e.g. the draft
  `packages/contents/src/posts/2099-12-31/test.mdx:35,43`) use Astro
  `client:only="react"` for `<BarChart>`/`<RadarChart>`. v5's `@mdx-js/rollup` does **not**
  interpret that directive — the attribute lands on the component as a plain prop during SSR,
  so **client-only charts would SSR in v5**. Migrate those blocks to the v5 `ClientOnly`/`LazyOnly` idiom.
- 🟡 **Redundant import** — `posts/$slug.tsx:50` / `pages/$slug.tsx:47` re-`import()` the MDX by
  file path even though `post.Content` is already in the eager glob map
  (`content/posts.ts:40` / `pages.ts:37`). Consolidate to a single source of truth.

---

## 6. Cross-cutting infrastructure (behavioral impact)

**Theme atom** — `atoms/theme.ts` (v4, 1-line re-export of `@@common/atoms/theme`) →
`atoms/theme.tsx` (v5, **verbatim local copy**). Logic identical (`fl_theme` key, 6h expiry,
system-preference fallback). 🔵 The `@furtherland/common` dependency + `@@common` alias were **removed** and
the atom inlined — ⚪ drift risk: two copies can now diverge.

**Theme representation** — v4: SCSS partial (`theme.scss`) of `--fl-theme-*` CSS vars + mixins,
with the actual values in `globalStyles.scss`. v5: a JS theme object consumed by Emotion
(`providers/theme.tsx`, typed via `theme.d.ts`); the same 14 `--fl-theme-*` values +
`html,body` base rules now live in a `<Global>` inside `ThemeProvider`. **All concrete
colours/breakpoints/base rules are value-for-value identical.** Minor diffs:
- ⚪ v5 `styles/theme.scss` was copied but is **unused** and its comments still describe the
  v4/Astro setup.
- ⚪ v5 adds a `fontSizes` ladder (v4 SCSS had none) and inserts a second generic `sans-serif`
  into the font stack (`theme.tsx:83-85`).
- ⚪ `breakpoint.matchesDown()` is an **empty `// TODO` stub** (`providers/theme.tsx:30`).

**`styles.css` (v5) vs `globalStyles.scss` (v4)** — v5's `styles.css` is a **brand-new design
system** (Google Fonts, a `--sea-ink/--lagoon/...` palette, `.nav-link`, `.demo-*`, animations)
and **none of v4's rules are in it**. Confirmed: **`styles.css` is imported by no module in v5**
→ it is dead code that never reaches the build; v5's actual runtime globals are only the
`ThemeProvider` `<Global>` (v4-era values). If/when wired in it would **conflict** with the
`<Global>` `body` rules (two `font-family`/`background`/`color`). 🟡 Decide: wire it in
(and resolve the `body` conflicts) or delete it.

**Content config** — v4 single `content.config.ts` (Astro `glob` loader, `getCollection`,
`render`, throws on invalid frontmatter, honors `FL_CONTENTS_DIR`). v5 splits into
`content/posts.ts` + `content/pages.ts` + `content/types.ts` (build-time `import.meta.glob`,
zod `safeParse` + **silently skips** invalid entries, eager `Record<slug, Entry>` maps).
- 🟠 **`FL_CONTENTS_DIR` override dropped** — v4 `astro.config.ts:47-51`; v5 hardcodes
  `@@contents` → `../contents/src` (`vite.config.ts:31`). (Both frontends read the *same*
  physical dir `packages/contents/src`.) Decide whether to carry the override over.
- 🔵/🟡 **Invalid frontmatter:** v4 throws at build; v5 silently drops the entry (build no longer
  fails on bad frontmatter).
- 🟠 **MDX sanitization dropped** — v4's pipeline ran `@astrojs/markdown-satteri` + `markdown-it`
  + `sanitize-html`; v5 compiles MDX straight to React with **no sanitization step**.
- 🔵 Both zod schemas (posts `2099-12-31`→draft; pages `isDraft = !isPublished`) are
  **field-for-field identical**, and draft visibility at the summary level matches.

**Build config** — v4 `astro.config.ts`: `site`, `output:'static'`, `react()+mdx()+sitemap()`,
`@furtherland/common` alias, `FL_CONTENTS_DIR` define, `shikiConfig`, `outDir:'build/client'`,
`build.format:'preserve'`. v5 `vite.config.ts`: `devtools()`, `tanstackStart()` (no options),
`mdx(remark*/rehypeShiki)`, `viteReact()`, aliases `@@frontend-v5`/`@@contents`/`@@post-components`,
`resolve.tsconfigPaths`, a PnP-warning logger suppression. Removed with no v5 equivalent: `site`,
**sitemap**, `FL_CONTENTS_DIR`, `outDir`, `build.format`.

**Type declarations** — v4 `vite-env.d.ts` (custom `import.meta.projectDir/contentsDir`) +
`asset-types.d.ts` (declares `*.mdx` and `*.jxl`). v5 has neither file; it relies on stock
`vite/client` (types `import.meta.env.*` **and** the image-asset imports — `background.jxl`/
`.avif`/`.webp`/`.jpg`) plus `import.meta.glob<MdxModule>` generics for `*.mdx`
(`content/types.ts`). 🔵 Mechanism change only: `tsc --project packages/frontend-v5/tsconfig.json
--noEmit` passes clean, so asset/`.mdx` typing is fully covered (v4's `asset-types.d.ts` has no
v5 counterpart, but nothing breaks).

**Dependencies** —
- *New in v5:* `@emotion/react`, `@emotion/styled`, `@mdx-js/rollup`, `@shikijs/rehype`,
  `@tanstack/react-start`, `@tanstack/react-router`, `@tanstack/router-core`,
  `@tanstack/react-devtools`, `@tanstack/react-router-devtools` (+ dev: `vite`,
  `@vitejs/plugin-react`, `@tanstack/devtools-vite`, `@tanstack/router-cli`).
- *Gone in v5:* `astro`, `@astrojs/react`, `@astrojs/mdx`, `@astrojs/rss`, `@astrojs/sitemap`,
  `@astrojs/markdown-satteri`, `@furtherland/common`, `fast-glob`, `isbot`, `markdown-it`,
  `sanitize-html`, `serve`, `sharp`, `sharp-cli`.
- *Kept:* `react`, `react-dom`, `react-icons`, `nanostores`, `@nanostores/react`,
  `@giscus/react`, `@furtherland/contents`, `@furtherland/post-components`, `remark-*`, `sass`,
  `usehooks-ts`, `zod`, `@biomejs/biome`, `typescript`, `@types/*`.

**Constants** — `constants/site.ts` is **byte-identical** in both. ⚠️ but v5 components
(`Author`/`Footer`/`Header/Content`) hardcode the site/author name literals instead of importing
these constants, so `constants/site.ts` is now **orphaned** for those — drift risk.
