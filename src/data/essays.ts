import { getCollection, type CollectionEntry } from 'astro:content';

export type Essay = CollectionEntry<'essays'>;

/** Published essays, newest first. Drafts are included in dev so they can be previewed. */
export async function getEssays(): Promise<Essay[]> {
	const all = await getCollection('essays', ({ data }) => import.meta.env.DEV || !data.draft);
	return all.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());
}

export const FORMAT_LABEL = {
	essay: 'Essay',
	playbook: 'Playbook',
	interactive: 'Interactive',
	video: 'Video',
} as const;

export function readingTime(body = ''): number {
	return Math.max(1, Math.round(body.split(/\s+/).length / 230));
}
