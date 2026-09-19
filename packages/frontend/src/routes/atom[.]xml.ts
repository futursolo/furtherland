/// <reference types="@tanstack/react-start" />

import { createFileRoute } from '@tanstack/react-router';

import { buildAtomFeed } from '@@frontend/server/feed.server';

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
