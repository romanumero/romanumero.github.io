#!/usr/bin/env node
// Create a new essay: npm run new "My Post Title" [-- --track mmm --format playbook --part 2]
import { existsSync, writeFileSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { DRAFTS_DIR } from '../src/drafts-dir.mjs';

const TRACKS = ['ai', 'evals', 'automation', 'analytics', 'mmm', 'incrementality', 'process', 'leadership'];
const FORMATS = ['essay', 'playbook', 'interactive', 'video'];

const { values, positionals } = parseArgs({
	allowPositionals: true,
	options: { track: { type: 'string', default: 'ai' }, format: { type: 'string', default: 'essay' }, part: { type: 'string' } },
});
const title = positionals.join(' ').trim();
if (!title) {
	console.error('Usage: npm run new "Post title" -- --track mmm --format essay --part 2');
	console.error(`Tracks: ${TRACKS.join(', ')}\nFormats: ${FORMATS.join(', ')}`);
	process.exit(1);
}
if (!TRACKS.includes(values.track)) throw new Error(`Unknown track "${values.track}". Use one of: ${TRACKS.join(', ')}`);
if (!FORMATS.includes(values.format)) throw new Error(`Unknown format "${values.format}". Use one of: ${FORMATS.join(', ')}`);

const slug = title.toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const ext = values.format === 'interactive' ? 'mdx' : 'md';
// New posts go to the private drafts repo; fall back to the public essays folder (as draft: true) if it isn't cloned.
const dir = existsSync(DRAFTS_DIR) ? DRAFTS_DIR : 'src/content/essays';
const file = `${dir}/${slug}.${ext}`;
if (existsSync(file)) throw new Error(`${file} already exists`);

const today = new Date().toISOString().slice(0, 10);
const lines = [
	'---',
	`title: "${title.replaceAll('"', '\\"')}"`,
	'description: "One or two sentences. Shows under the title and in link previews."',
	`date: ${today}`,
	`track: ${values.track}`,
	`format: ${values.format}`,
	...(values.part ? [`part: ${values.part}`] : []),
	'draft: true',
	'---',
	'',
	'Start with the problem your reader has this week.',
	'',
	'## What to do about it',
	'',
	'Use <mark>highlights</mark> for the one sentence that matters.',
	'',
];
writeFileSync(file, lines.join('\n'));
console.log(`Created ${file}\nPreview: npm run dev, then open /essays/${slug}/\nPublish: npm run publish ${slug}`);
