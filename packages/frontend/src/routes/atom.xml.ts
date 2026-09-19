import { buildAtomFeed } from '@@frontend/server/feed.server';

export async function loader() {
  return new Response(await buildAtomFeed(), {
    headers: { 'content-type': 'application/atom+xml; charset=utf-8' },
  });
}
