import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { TRACK_IDS } from './data/tracks';

const essays = defineCollection({
	loader: glob({ base: './src/content/essays', pattern: '**/*.{md,mdx}' }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		date: z.coerce.date(),
		updated: z.coerce.date().optional(),
		track: z.enum(TRACK_IDS),
		format: z.enum(['essay', 'playbook', 'interactive', 'video']).default('essay'),
		// Which part of the book this essay drafts (1-5), if any.
		part: z.number().int().min(1).max(5).optional(),
		youtube: z.string().url().optional(),
		featured: z.boolean().default(false),
		// Drafts show in `npm run dev` only.
		draft: z.boolean().default(false),
	}),
});

export const collections = { essays };
