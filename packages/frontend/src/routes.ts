import { index, type RouteConfig, route } from '@react-router/dev/routes';

export default [
  index('routes/index.tsx'),
  route('/404', 'routes/404.tsx'),
  route('/posts/:slug', 'routes/posts/$slug.tsx'),
  route('/pages/:slug', 'routes/pages/$slug.tsx'),
  route('/atom.xml', 'routes/atom.xml.ts'),
  route('/robots.txt', 'routes/robots.txt.ts'),
  route('/sitemap-index.xml', 'routes/sitemap-index.xml.ts'),
  route('/sitemap-0.xml', 'routes/sitemap-0.xml.ts'),
] satisfies RouteConfig;
