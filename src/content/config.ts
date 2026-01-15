import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
  }),
});

const portfolioCollection = defineCollection({
  schema: z.object({
    title: z.string(),
    category: z.enum(['residential', 'commercial', 'custom']),
    displayCategory: z.string(),
    description: z.string(),
    featured: z.boolean().optional().default(false),
    year: z.number().optional(),
  }),
});

const testimonialCollection = defineCollection({
  schema: z.object({
    name: z.string(),
    role: z.string().optional(),
    company: z.string().optional(),
    rating: z.number().min(1).max(5),
    content: z.string(),
    date: z.date().optional(),
    featured: z.boolean().optional().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
  portfolio: portfolioCollection,
  testimonial: testimonialCollection,
};
