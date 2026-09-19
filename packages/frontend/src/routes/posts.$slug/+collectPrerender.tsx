const posts = import.meta.glob<{ frontmatter?: { date?: string } }>(['@@contents/posts/**/*.mdx']);

export default async () => {
  const paths: string[] = [];
  for (const [key, load] of Object.entries(posts)) {
    const { frontmatter } = await load();
    // A post dated 2099-12-31 is a draft (hidden in production), so it is not
    // prerendered.
    if (frontmatter?.date === '2099-12-31') continue;
    const slug =
      key
        .split('/')
        .pop()
        ?.replace(/\.mdx$/, '') ?? '';
    paths.push(`/posts/${slug}`);
  }
  return paths;
};
