import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blogCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.string().optional(),
    image: z.string().optional(),
  }),
});

const portfolioCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/portfolio' }),
  schema: z.object({
    title: z.string(),
    category: z.enum(['residential', 'commercial', 'custom']),
    displayCategory: z.string(),
    description: z.string(),
    image: z.string().optional(),
    gallery: z.array(z.string()).optional(),
    featured: z.boolean().optional().default(false),
    year: z.number().optional(),
    location: z.string().optional(),
    address: z.string().optional(),
    seoTitle: z.string().optional(),
    seoDescription: z.string().optional(),
    keywords: z.string().optional(),
  }),
});

const testimonialCollection = defineCollection({
  loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: './src/content/testimonial' }),
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
    company: z.string().optional(),
    rating: z.number().min(1).max(5),
    content: z.string(),
    date: z.coerce.date().optional(),
    featured: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
  portfolio: portfolioCollection,
  testimonial: testimonialCollection,
};
