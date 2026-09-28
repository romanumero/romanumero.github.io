import { getCollection, type CollectionEntry } from 'astro:content';

export type Essay = CollectionEntry<'essays'> | CollectionEntry<'drafts'>;

/**
 * Published essays, newest first. In dev, also includes drafts: posts marked `draft: true`
 * and everything in the private drafts repo (always treated as drafts).
 */
export async function getEssays(): Promise<Essay[]> {
	const all: Essay[] = await getCollection('essays', ({ data }) => import.meta.env.DEV || !data.draft);
	if (import.meta.env.DEV) {
		const drafts = await getCollection('drafts');
		all.push(...drafts.map((d) => ({ ...d, data: { ...d.data, draft: true } })));
	}
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
