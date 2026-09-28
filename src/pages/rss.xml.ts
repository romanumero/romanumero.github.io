import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '../consts';
import { getEssays } from '../data/essays';

export async function GET(context: APIContext) {
	const essays = (await getEssays()).filter((e) => !e.data.draft);
	return rss({
		title: SITE.title,
		description: SITE.description,
		site: context.site!,
		items: essays.map((e) => ({
			title: e.data.title,
			description: e.data.description,
			pubDate: e.data.date,
			link: `/essays/${e.id}/`,
		})),
	});
}
