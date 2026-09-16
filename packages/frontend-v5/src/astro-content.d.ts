// Minimal type shim for the Astro content-collection API. The recovered v4
// components import `CollectionEntry` from `astro:content`; v5 does not use
// Astro, so this ambient declaration lets those imports type-check. The `data`
// shape mirrors the v4 `posts` collection schema.
declare module 'astro:content' {
  export type CollectionEntry<Collection extends string = 'posts'> = {
    slug: string;
    body: string;
    data: {
      date: string;
      slug: string;
      title: string;
      description?: string;
      isDraft: boolean;
    };
  };
}
