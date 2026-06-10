import { defineCollection } from 'astro:content';
import { z } from 'zod';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    type: z.enum(['research', 'project']),
    date: z.date(),
    links: z.array(z.object({ label: z.string(), url: z.string() })).optional(),
  }),
});

export const collections = { work };
