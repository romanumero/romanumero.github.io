// @ts-check
import mdx from '@astrojs/mdx';
import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	site: 'https://romanumero.github.io',
	trailingSlash: 'always',
	integrations: [mdx(), react(), sitemap()],
	fonts: [
		{ provider: fontProviders.google(), name: 'Newsreader', cssVariable: '--font-serif', weights: [400, 500], styles: ['normal', 'italic'], fallbacks: ['Georgia', 'serif'] },
		{ provider: fontProviders.google(), name: 'Space Grotesk', cssVariable: '--font-display', weights: [500, 600, 700], fallbacks: ['system-ui', 'sans-serif'] },
		{ provider: fontProviders.google(), name: 'IBM Plex Sans', cssVariable: '--font-sans', weights: [400, 500, 600], fallbacks: ['system-ui', 'sans-serif'] },
		{ provider: fontProviders.google(), name: 'IBM Plex Mono', cssVariable: '--font-mono', weights: [400, 500], fallbacks: ['ui-monospace', 'monospace'] },
	],
	// Keep links to the old MkDocs site working.
	redirects: {
		'/thoughts/': '/essays/',
		'/thoughts/2026/01/14/the-terminal-was-never-the-problem-access-was/': '/essays/the-terminal-was-never-the-problem/',
		'/thoughts/2024/12/28/from-imposter-to-leader-embracing-the-journey/': '/essays/from-imposter-to-leader/',
		'/thoughts/2025/02/23/the-strategic-advantage-of-fractional-ctos-in-marketing-and-advertising-navigating-the-technology-revolution/': '/essays/',
		'/essays/fractional-cto/': '/essays/', // unpublished 2026-09-28
		'/thoughts/2025/01/18/the-complete-guide-to-measuring-advertising-performance-understanding-the-magic-framework/': '/essays/magic-framework/',
		'/companies/': '/about/',
		'/books/': '/about/',
		'/tools/': '/about/',
	},
});
