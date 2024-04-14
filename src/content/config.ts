import { defineCollection, z } from "astro:content";
const work = defineCollection({
  schema: z.object({
    pubDate: z.date(),
    title: z.string(),
    subtitle: z.string(),
    live: z.string(),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
  }),
});
const store = defineCollection({
  schema: z.object({
    price: z.string(),
    title: z.string(),
    preview: z.string(),
    checkout: z.string(),
    license: z.string(),
    highlights: z.array(z.string()),
    description: z.string(),
    features: z.array(
      z.object({
        title: z.string(),
        description: z.string(),
      })
    ),
    image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
    images: z.array(
      z.object({
        url: z.string(),
        alt: z.string(),
      })
    ),
  }),
});
const projects = defineCollection({
  schema: z.object({
    pubDate: z.date(),
    title: z.string(),
    subtitle: z.string(),
    live: z.string(),
    logo: z.object({
      url: z.string(),
      alt: z.string(),
    }),
     image: z.object({
      url: z.string(),
      alt: z.string(),
    }),
  }),
});
const postsCollection = defineCollection({
    schema: z.object({
      title: z.string(),
      pubDate: z.date(),
      description: z.string(),
      author: z.string(),
      image: z.object({
        url: z.string(),
        alt: z.string()
      }),
      tags: z.array(z.string())
    })
 });

export const collections = {
  work: work,
  store: store,
  projects: projects,
  posts: postsCollection,
};