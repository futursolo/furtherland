const pages = import.meta.glob<{ frontmatter?: { isPublished?: boolean } }>([
  '@@contents/pages/**/*.mdx',
]);

export default async () => {
  const paths: string[] = [];
  for (const [key, load] of Object.entries(pages)) {
    const { frontmatter } = await load();
    // A page is a draft unless it is explicitly published, so drafts (which 404 in
    // production) are not prerendered.
    if (!frontmatter?.isPublished) continue;
    const slug =
      key
        .split('/')
        .pop()
        ?.replace(/\.mdx$/, '') ?? '';
    paths.push(`/pages/${slug}`);
  }
  return paths;
};
