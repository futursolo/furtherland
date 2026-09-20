import { getPageSummaries } from '@@frontend/content/pages.server';

export default async () => {
  const pages = await getPageSummaries();
  return pages.filter((page) => !page.isDraft).map((page) => `/pages/${page.slug}`);
};
