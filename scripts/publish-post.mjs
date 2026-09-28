#!/usr/bin/env node
// Move a draft from the private drafts repo into the public site:
//   npm run publish <slug>
// Sets today's date, removes `draft: true`, and moves the file to src/content/essays/.
// Afterwards: commit + push the site repo (goes live), and commit the removal in the drafts repo.
import { existsSync, readFileSync, renameSync, unlinkSync, writeFileSync, copyFileSync } from 'node:fs';
import path from 'node:path';
import { DRAFTS_DIR } from '../src/drafts-dir.mjs';

const slug = process.argv[2];
if (!slug) {
	console.error('Usage: npm run publish <slug>   (the file name without .md/.mdx)');
	process.exit(1);
}
const src = ['md', 'mdx'].map((ext) => path.join(DRAFTS_DIR, `${slug}.${ext}`)).find(existsSync);
if (!src) throw new Error(`No draft named "${slug}" in ${DRAFTS_DIR}`);
const dest = path.join('src/content/essays', path.basename(src));
if (existsSync(dest)) throw new Error(`${dest} already exists`);

const today = new Date().toISOString().slice(0, 10);
let text = readFileSync(src, 'utf8');
text = text.replace(/^draft:\s*true\s*\n/m, '').replace(/^date:.*$/m, `date: ${today}`);
writeFileSync(dest, text);
unlinkSync(src);
console.log(`Published ${dest} (dated ${today}).
Next:
  git add ${dest} && git commit -m "Publish: ${slug}" && git push          # goes live
  (cd ${DRAFTS_DIR} && git add -A && git commit -m "Published ${slug}" && git push)`);
