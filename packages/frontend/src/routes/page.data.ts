import { getPostSummaries, type PostEntry } from '@@frontend/content/posts.server';

export const loader = async () => {
  // Draft summaries are development-only. The dynamic import keeps the draft
  // content module (and the MDX chunks behind its glob) out of the
  // production client bundle, where the branch is dead code.
  const draftSummaries = import.meta.env.PROD
    ? Promise.resolve([] as PostEntry[])
    : import('@@frontend/content/posts-drafts.server').then((m) => m.getDraftPostSummaries());
  const [drafts, published] = await Promise.all([draftSummaries, getPostSummaries()]);

  return { summaries: [...drafts, ...published] };
};
