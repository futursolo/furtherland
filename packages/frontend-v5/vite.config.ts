import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { devtools } from '@tanstack/devtools-vite';
import mdx from '@mdx-js/rollup';
import rehypeShiki from '@shikijs/rehype';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { createLogger, defineConfig } from 'vite';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');

const logger = createLogger()
const loggerWarnOnce = logger.warnOnce
logger.warnOnce = (msg, options) => {
  if (msg.includes('Using Yarn PnP with Vite is discouraged and PnP-specific bugs will no longer be actively worked on.')) {
    return
  }
  loggerWarnOnce(msg, options)
  }

// v5 (`@mdx-js/rollup`) does not interpret Astro's `client:only` / `client:visible`
// directives — the attribute lands on the component as a plain prop, so a
// client-only element would be SSR-rendered, breaking the client-only intent. This
// rewrites each such directive into a `ClientOnly` / `LazyOnly` wrapper (see
// `components/ClientOnly.tsx` / `LazyOnly.tsx`); the compiled MDX resolves those
// from the `components` map. The shared `@furtherland/contents` MDX stays
// framework-agnostic (it still uses the Astro-style directive, which v4 applies
// natively).
type MdxAstNode = {
  type?: string;
  name?: string;
  attributes?: Array<{ name?: string; value?: unknown }>;
  children?: MdxAstNode[];
};

const clientDirectiveWrappers: Record<string, string> = {
  'client:only': 'ClientOnly',
  'client:visible': 'LazyOnly',
};

const rewriteClientDirectives = (tree: MdxAstNode): void => {
  const visit = (node: MdxAstNode | undefined): void => {
    if (!node || typeof node !== 'object' || !Array.isArray(node.children)) return;
    for (let i = 0; i < node.children.length; i++) {
      const child = node.children[i];
      const isJsx = child && (child.type === 'mdxJsxFlowElement' || child.type === 'mdxJsxTextElement');
      if (isJsx && Array.isArray(child.attributes)) {
        const directive = child.attributes.find(
          (attr) => typeof attr?.name === 'string' && attr.name.startsWith('client:')
        );
        if (directive && typeof directive.name === 'string') {
          const wrapperName = clientDirectiveWrappers[directive.name] ?? 'ClientOnly';
          child.attributes = child.attributes.filter(
            (attr) => !(typeof attr?.name === 'string' && attr.name.startsWith('client:'))
          );
          node.children[i] = { type: child.type, name: wrapperName, attributes: [], children: [child] };
          visit(node.children[i]);
          continue;
        }
      }
      visit(child);
    }
  };
  visit(tree);
};

const rewriteClientDirectivesPlugin = () => (tree: MdxAstNode): void => rewriteClientDirectives(tree);

const config = defineConfig({
  customLogger: logger,
  resolve: {
    tsconfigPaths: true,
    alias: {
      '@@frontend-v5': path.resolve(import.meta.dirname, 'src'),
      '@@common': path.resolve(import.meta.dirname, '../common/src'),
      '@@contents': path.resolve(import.meta.dirname, '../contents/src'),
      '@@post-components': path.resolve(import.meta.dirname, '../post-components/src'),
    },
  },
  server: {
    fs: {
      allow: [repoRoot],
    },
  },
  plugins: [
    devtools(),
    tanstackStart({
      // `/robots.txt`, the Atom feed, and the sitemap routes are server routes (no
      // `component`), so the auto-discovery skips them, and none is linked from a
      // page. List them explicitly so the build prerenders each to a static file
      // under `dist/client/` (`robots.txt`, `atom.xml`, `sitemap-index.xml`,
      // `sitemap-0.xml`).
      pages: [
        { path: '/atom.xml' },
        { path: '/robots.txt' },
        { path: '/sitemap-index.xml' },
        { path: '/sitemap-0.xml' },
      ],
      prerender: {
        enabled: true,
        crawlLinks: true,
        failOnError: true,
      },
    }),
    mdx({
      remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
      // `rewriteClientDirectives` first so it runs on the (pre-highlight) hast;
      // shiki mirrors v4's `markdown.shikiConfig.themes`: dual-theme highlighting,
      // switched on the client via the `data-theme` attribute.
      rehypePlugins: [rewriteClientDirectivesPlugin, [rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }]],
    }),
    viteReact(),
  ],
});

export default config;
