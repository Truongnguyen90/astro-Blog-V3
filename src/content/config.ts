import { defineCollection, z } from "astro:content";

const work = defineCollection({
  schema: ({ image }) =>
    z.object({
      pubDate: z.date(),
      title: z.string(),
      subtitle: z.string(),
      live: z.string(),
      image: z.object({
        url: image(),
        alt: z.string(),
      }),
    }),
});

const store = defineCollection({
  schema: ({ image }) =>
    z.object({
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
        url: image(),
        alt: z.string(),
      }),
      images: z.array(
        z.object({
          url: image(),
          alt: z.string(),
        })
      ),
    }),
});

const projects = defineCollection({
  schema: ({ image }) =>
    z.object({
      pubDate: z.date(),
      title: z.string(),
      subtitle: z.string(),
      live: z.string(),
      logo: z.object({
        url: image(),
        alt: z.string(),
      }),
      image: z.object({
        url: image(),
        alt: z.string(),
      }),
    }),
});

const postsCollection = defineCollection({
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      pubDate: z.date(),
      description: z.string(),
      author: z.string(),
      image: z.object({
        url: image(),
        alt: z.string(),
      }),
      tags: z.array(z.string()),
    }),
});

const authors = defineCollection({
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      role: z.string().optional(),
      bio: z.string().optional(),
      image: z.object({
        url: image(),
        alt: z.string(),
      }),
      socials: z
        .object({
          twitter: z.string().optional(),
          website: z.string().optional(),
          linkedin: z.string().optional(),
          email: z.string().optional(),
        })
        .optional(),
    }),
});

export const collections = {
  work,
  store,
  projects,
  posts: postsCollection,
  authors,
};
