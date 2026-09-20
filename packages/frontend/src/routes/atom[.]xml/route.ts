import { buildAtomFeed } from './feed.server';

export const loader = async () => {
  return new Response(await buildAtomFeed(), {
    headers: { 'content-type': 'application/atom+xml; charset=utf-8' },
  });
};
