export default async () => {
  // The 404 page is served for arbitrary unmatched paths, so there is no single
  // static path to prerender for it.
  return [];
};
