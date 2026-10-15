import { getDraftPostSummaries, getPostSummaries } from '@@frontend/content/posts.server';

export const loader = async () => {
  const summaries = [
    ...(import.meta.env.PROD ? [] : await getDraftPostSummaries()),
    ...(await getPostSummaries()),
  ];

  return { summaries };
};
