import { getDraftPostSummaries } from '@@frontend/content/posts.server';

export default async () => {
  return (await getDraftPostSummaries()).map((post) => `/post-drafts/${post.slug}`);
};
