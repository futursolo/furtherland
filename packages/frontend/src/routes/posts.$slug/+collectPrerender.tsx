import { getPostSummaries } from '@@frontend/content/posts.server';

export default async () => {
  const posts = await getPostSummaries();
  return posts.filter((post) => !post.isDraft).map((post) => `/posts/${post.slug}`);
};
