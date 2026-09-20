import { flatRoutes } from '@react-router/fs-routes';

export default flatRoutes({
  ignoredRouteFiles: process.env.FL_BUILDING
    ? ['routes/page-drafts.$slug', 'routes/post-drafts.$slug']
    : [],
});
