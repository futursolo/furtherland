import { flatRoutes } from '@react-router/fs-routes';

export default flatRoutes({
  ignoredRouteFiles: import.meta.env.PROD
    ? ['routes/page-drafts.$slug', 'routes/post-drafts.$slug']
    : [],
});
