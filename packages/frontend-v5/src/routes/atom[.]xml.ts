/// The `server` route option is augmented onto `@tanstack/router-core` by
/// `@tanstack/react-start`. No other file imports that entry point, so reference
/// it here to activate the augmentation for the `server` handler below (type-only;
/// no runtime import, so it stays out of the client bundle).
/// <reference types="@tanstack/react-start" />

import { createFileRoute } from '@tanstack/react-router';

import { buildAtomFeed } from '@@frontend-v5/server/feed.server';

// Atom feed (the v5 replacement for v4's `/rss.xml` RSS endpoint). A pure server
// route (only a `server` handler, no component) so it is pruned from the client
// bundle and served/prerendered as a raw `application/atom+xml` file rather than
// HTML. `feed.server` keeps `react-dom/server` + feedsmith out of the client.
export const Route = createFileRoute('/atom.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(await buildAtomFeed(), {
          headers: { 'content-type': 'application/atom+xml; charset=utf-8' },
        }),
    },
  },
});
