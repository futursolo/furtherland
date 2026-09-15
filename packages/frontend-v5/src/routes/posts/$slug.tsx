import { createFileRoute } from '@tanstack/react-router';

import { posts } from '@@frontend-v5/content/posts';

export const Route = createFileRoute('/posts/$slug')({
  component: PostPage,
});

function PostPage() {
  const { slug } = Route.useParams();
  const Content = posts[slug];

  if (!Content) {
    return (
      <main className="page-wrap px-4 py-12">
        <section className="island-shell rounded-2xl p-6 text-center sm:p-8">
          <p className="island-kicker mb-2">404</p>
          <h1 className="display-title mb-2 text-3xl font-bold text-[var(--sea-ink)] sm:text-4xl">
            Post not found
          </h1>
          <p className="m-0 text-sm text-[var(--sea-ink-soft)]">
            No post exists at <code>{`/posts/${slug}`}</code>.
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="page-wrap px-4 py-12">
      <article className="island-shell rounded-2xl p-6 sm:p-8">
        <div className="prose prose-neutral mx-auto max-w-3xl">
          <Content />
        </div>
      </article>
    </main>
  );
}
