import { getDraftPageSummaries } from '@@frontend/content/pages.server';

export default async () => {
  return (await getDraftPageSummaries()).map((page) => `/page-drafts/${page.slug}`);
};
