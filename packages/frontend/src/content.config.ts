import path from 'node:path';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

import { defineCollection } from 'astro:content';

const posts = defineCollection({
  loader: glob({
    base: path.resolve(import.meta.contentsDir, 'posts'),
    pattern: '**/*.mdx',
  }),
  schema: z
    .object({
      date: z.string(),
      slug: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })
    .transform((data) => ({ ...data, isDraft: data.date === '2099-12-31' })),
});

const pages = defineCollection({
  loader: glob({
    base: path.resolve(import.meta.contentsDir, 'pages'),
    pattern: '**/*.mdx',
  }),
  schema: z
    .object({
      isPublished: z.boolean().default(false),
      slug: z.string(),
      title: z.string(),
      description: z.string().optional(),
    })
    .transform((data) => ({ ...data, isDraft: !data.isPublished })),
});

export const collections = { posts, pages };
