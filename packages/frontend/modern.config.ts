import {
  cpSync,
  existsSync,
  mkdirSync,
  readdirSync,
  readFileSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { IncomingMessage, ServerResponse } from 'node:http';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { appTools, defineConfig } from '@modern-js/app-tools';
import type { AppTools, CliPlugin } from '@modern-js/app-tools';
import { createProdServer, loadServerPlugins } from '@modern-js/prod-server';
import type { ServerRoute } from '@modern-js/types';
import { pluginMdx } from '@rsbuild/plugin-mdx';
import rehypeShiki from '@shikijs/rehype';
import { rehypeGithubAlerts } from 'rehype-github-alerts';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import remarkMdxFrontmatter from 'remark-mdx-frontmatter';

import { fixStaticHead, staticMetaForRoute } from './site-head';
import { buildSiteXml, collectPages, collectPosts } from './site-xml';
import { SITE_NAME, SITE_URL } from './src/constants/site';

const configDir = path.dirname(fileURLToPath(import.meta.url));

// The XML / text endpoints served verbatim (never rendered to HTML). In dev
// they are answered by a dev-server middleware; in production they are written
// to the static output by the `staticSite` post-build step.
const XML_ENDPOINTS = new Set(['robots.txt', 'atom.xml', 'sitemap-index.xml', 'sitemap-0.xml']);

// Set inside defineConfig from the `command` param — `process.env.NODE_ENV` is
// `production` for both `modern dev` and `modern build`, so it cannot be used
// to distinguish the two.
let isProd = false;

const contentsRoot = (): string =>
  process.env.FL_CONTENTS_DIR
    ? path.resolve(process.cwd(), process.env.FL_CONTENTS_DIR)
    : path.resolve(configDir, '../contents/src');

/**
 * The set of routes rendered to static HTML at build time: the home page, the
 * 404 page (flattened to 404.html in the static output), and every published
 * post / page. The XML / text endpoints are intentionally NOT in this list —
 * they are emitted as static files by the `staticSite` post-build step.
 */
const collectSsgRoutes = (): string[] => {
  const routes: string[] = ['/', '/404'];
  const root = contentsRoot();

  const postsDir = path.join(root, 'posts');
  if (existsSync(postsDir)) {
    for (const date of readdirSync(postsDir)) {
      const dateDir = path.join(postsDir, date);
      if (!statSync(dateDir).isDirectory()) continue;
      for (const file of readdirSync(dateDir)) {
        if (!file.endsWith('.mdx')) continue;
        routes.push(`/posts/${file.slice(0, -path.extname(file).length)}`);
      }
    }
  }

  const pagesDir = path.join(root, 'pages');
  if (existsSync(pagesDir)) {
    for (const file of readdirSync(pagesDir)) {
      if (!file.endsWith('.mdx')) continue;
      routes.push(`/pages/${file.slice(0, -path.extname(file).length)}`);
    }
  }

  return routes;
};

const ssgRoutes = collectSsgRoutes();

// Raw Rsbuild plugin, registered via builderPlugins (the modifyRsbuildConfig
// hook runs after Rsbuild plugins are initialized, too late to add plugins).
const mdx = pluginMdx({
  extensions: ['.mdx'],
  mdxLoaderOptions: {
    remarkPlugins: [remarkFrontmatter, remarkMdxFrontmatter, remarkGfm],
    rehypePlugins: [
      [rehypeShiki, { themes: { light: 'github-light', dark: 'github-dark' } }],
      rehypeGithubAlerts,
    ],
  },
});

const createMockRequest = (url: string): IncomingMessage => {
  const urlObj = new URL(url);
  const mockReq = new IncomingMessage({} as unknown as net.Socket);
  mockReq.url = urlObj.pathname + urlObj.search;
  mockReq.method = 'GET';
  mockReq.headers = {
    host: urlObj.host,
    'user-agent': 'furtherland-ssg/1.0',
    accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
    // Makes the render handler wait for the full page (all Suspense
    // boundaries) before the response body completes.
    'x-modern-ssg-render': 'true',
  };
  mockReq.httpVersion = '1.1';
  mockReq.httpVersionMajor = 1;
  mockReq.httpVersionMinor = 1;
  mockReq.complete = true;
  mockReq.rawHeaders = [];
  mockReq.socket = {} as unknown as net.Socket;
  mockReq.connection = mockReq.socket;
  return mockReq;
};

/**
 * Renders every SSG route to static HTML after the production build.
 *
 * Unlike @modern-js/plugin-ssg (which renders up to 10 routes concurrently in
 * one process — react-helmet's module-level state is then shared between the
 * interleaved renders, corrupting the <head> tags), this renders routes one
 * at a time against the freshly built production server, so each page's
 * helmet data is captured in isolation. The rendered pages are flattened to
 * build/client/<route>.html (the shape Cloudflare Pages serves) alongside the
 * client assets and the generated XML / text endpoints.
 */
const staticSitePlugin: CliPlugin<AppTools> = {
  name: '@furtherland/frontend:static-site',
  setup(api) {
    api.onAfterBuild(async () => {
      if (!isProd) return;
      const appContext = api.getAppContext();
      const config = api.getNormalizedConfig();
      const distDir = appContext.distDirectory;
      const outDir = path.join(configDir, 'build', 'client');

      // The hook also fires when the build failed (artifacts missing) — in
      // that case there is nothing to assemble.
      if (!existsSync(path.join(distDir, 'static')) || !existsSync(path.join(distDir, 'route.json'))) return;

      rmSync(outDir, { recursive: true, force: true });
      cpSync(path.join(distDir, 'static'), path.join(outDir, 'static'), { recursive: true });

      // Mark the SPA routes as SSR with their server bundle, so the
      // production server renders them to HTML instead of answering with an
      // SPA shell.
      const spec = JSON.parse(readFileSync(path.join(distDir, 'route.json'), 'utf-8')) as {
        routes: ServerRoute[];
      };
      const routes: ServerRoute[] = spec.routes.map((route) =>
        route.isSPA
          ? { ...route, isSSR: true, bundle: `bundles/${route.entryName}.js` }
          : route,
      );

      // The fresh <head> for each rendered route (the rendered helmet
      // output is stale/empty — see site-head.ts).
      const { posts, pages } = {
        posts: collectPosts(contentsRoot()),
        pages: collectPages(contentsRoot()),
      };

      const server = await createProdServer({
        pwd: distDir,
        // The normalized app config is structurally wider than the server's
        // CliConfig (e.g. output.inlineScripts also accepts a RegExp).
        config: config as unknown as Parameters<typeof createProdServer>[0]['config'],
        appContext: {
          internalDirectory: appContext.internalDirectory,
          appDirectory: appContext.appDirectory,
          sharedDirectory: appContext.sharedDirectory,
          apiDirectory: appContext.apiDirectory,
          lambdaDirectory: appContext.lambdaDirectory,
          bffRuntimeFramework: appContext.bffRuntimeFramework,
        },
        serverConfigPath: path.join(distDir, 'server', `${appContext.metaName}.server`),
        routes,
        plugins: await loadServerPlugins(appContext.serverPlugins, appContext.appDirectory || distDir),
        staticGenerate: true,
        logger: false,
      });
      const requestHandler = server.getRequestHandler();

      for (const route of ssgRoutes) {
        const url = `http://localhost${route}`;
        const mockReq = createMockRequest(url);
        const request = new Request(url, { method: 'GET', headers: { host: 'localhost' } });
        const response = await requestHandler(request, {
          node: { req: mockReq, res: new ServerResponse(mockReq) },
        });
        const html = fixStaticHead(
          await response.text(),
          staticMetaForRoute(route, posts, pages),
        );
        const routeDir = route === '/' ? '' : route.slice(1);
        const targetPath = path.join(outDir, routeDir === '' ? 'index.html' : `${routeDir}.html`);
        mkdirSync(path.dirname(targetPath), { recursive: true });
        writeFileSync(targetPath, html);
        console.log(`[static-site] ${route} -> ${path.relative(configDir, targetPath)}`);
      }

      // The XML / text endpoints are never rendered to HTML by the framework,
      // so they are generated here and written to the static output.
      for (const doc of await buildSiteXml(contentsRoot())) {
        writeFileSync(path.join(outDir, doc.file), doc.body);
      }
    });
  },
};

export default defineConfig(({ command }) => {
  isProd = command === 'build';
  // Expose a reliable dev/prod signal to files loaded later (e.g.
  // `src/modern.routes.ts`), which cannot read the `command` param and for
  // which `process.env.NODE_ENV` is `production` in both dev and build.
  process.env.FL_IS_PROD = isProd ? '1' : '0';
  return {
    plugins: [appTools(), staticSitePlugin],
    builderPlugins: [mdx],
    resolve: {
      alias: {
        '@@frontend': path.resolve(configDir, 'src'),
        '@@common': path.resolve(configDir, '../common/src'),
        '@@contents': contentsRoot(),
        '@@content-components': path.resolve(configDir, '../content-components/src'),
      },
    },
    server: {
      port: 1741,
      // SSR stays on for the production build too: the built server bundle is
      // what the `staticSite` plugin renders the static pages with (the
      // bundle itself is not deployed — only build/client is).
      ssr: true,
    },
    dev: {
      setupMiddlewares: [
        (middlewares) => {
          middlewares.unshift(async (req, res, next) => {
            const pathname = (req.url ?? '').split('?')[0];
            const file = pathname.startsWith('/') ? pathname.slice(1) : pathname;
            if (!XML_ENDPOINTS.has(file)) {
              next();
              return;
            }
            try {
              const docs = await buildSiteXml(contentsRoot());
              const doc = docs.find((d) => d.file === file);
              if (!doc) {
                next();
                return;
              }
              res.setHeader('content-type', doc.contentType);
              res.end(doc.body);
            } catch (error) {
              res.statusCode = 500;
              res.setHeader('content-type', 'text/plain; charset=utf-8');
              res.end(error instanceof Error ? error.message : String(error));
            }
          });
        },
      ],
    },
    html: {
      tags: [
        {
          tag: 'link',
          attrs: {
            rel: 'alternate',
            type: 'application/atom+xml',
            title: SITE_NAME,
            href: `${SITE_URL}/atom.xml`,
          },
          head: true,
        },
        {
          tag: 'link',
          attrs: { rel: 'sitemap', type: 'application/xml', href: `${SITE_URL}/sitemap-index.xml` },
          head: true,
        },
      ],
    },
  };
});
