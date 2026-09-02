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

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    summary: z.string().optional(),
  }),
});

// Origami gallery. Adding a model is two files, same name:
//   1. drop the photo in  public/origami/<name>.<jpg|png|webp|gif>
//   2. write the caption in src/content/origami/<name>.md
// The photo is matched to the entry by filename, so there's nothing to wire up.
// Files starting with "_" (like _template.md) are ignored by the loader.
const origami = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: './src/content/origami' }),
  schema: z.object({
    title: z.string(),
    date: z.date(),
    // Optional — only needed if the photo's filename differs from the .md's.
    // May be a bare filename ("crane.jpg") or an absolute path ("/origami/crane.jpg").
    image: z.string().optional(),
  }),
});

export const collections = { work, docs, origami };
