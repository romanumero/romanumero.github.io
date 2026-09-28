# Engineering the Modern Agency

Damon Henry's blog, built with [Astro](https://astro.build). Deploys to https://damonhenry.com (GitHub Pages, repo `romanumero/romanumero.github.io`) on every push to `master`.

## Writing and updating posts

Every post is one Markdown file in `src/content/essays/`. The file name is the URL:
`src/content/essays/from-imposter-to-leader.md` → `/essays/from-imposter-to-leader/`.

**Drafts are private.** They live in a separate private repo, [`romanumero/damonhenry-drafts`](https://github.com/romanumero/damonhenry-drafts), cloned to `~/Labs/damonhenry-drafts` (override with `DRAFTS_DIR`). This repo is public, so drafts never go here. `npm run dev` reads the drafts folder and shows each draft with a "Private draft" banner; the live build never includes it. Superset workspace setup clones the drafts repo automatically.

**New post**

```sh
npm run new "Where Should the Budget Go?" -- --track mmm --format essay --part 2
```

This creates the file in the drafts repo. Commit and push there to back it up (`cd ~/Labs/damonhenry-drafts && git add -A && git commit -m "…" && git push`).

**Publish**

```sh
npm run publish where-should-the-budget-go
```

This moves the draft into `src/content/essays/` with today's date. Commit and push this repo and it goes live in about a minute; then commit the removal in the drafts repo.

**Update a published post:** edit its file in `src/content/essays/`, save (dev reloads as you type), and push to `master`. Every post page in dev has an "Edit this post on GitHub" link. If you change a post substantially, add `updated: 2026-10-20` to the frontmatter so readers see it.

### Frontmatter

```yaml
---
title: "Every Platform Grades Its Own Homework"
description: "One or two sentences. Shows under the title, in lists and in link previews."
date: 2026-10-06
updated: 2026-10-20        # optional
track: incrementality      # ai | evals | automation | analytics | mmm | incrementality | process | leadership
format: essay              # essay | playbook | interactive | video
part: 2                    # optional: which book part this drafts (1-5)
youtube: https://...       # optional: companion video
featured: true             # optional: the homepage's featured explainer
draft: false
---
```

### Writing tools

- `<mark>the one sentence that matters</mark>`: the highlighter. Use it once or twice per post, not more.
- `> A pull quote` renders as a large italic quote.
- In `.mdx` files you can also use:
  - `<Say instead="Facebook had a 2.5x ROAS.">Our geo test showed…</Say>`: the "instead of / say" block
  - `<Monday>` + a Markdown list + `</Monday>`: the "What to do Monday" checklist
  - Interactive explainers: `<PlatformClaims client:visible />`, `<BudgetSplit client:visible />` (import them at the top; see `every-platform-grades-its-own-homework.mdx`)

## Where things live

| What | File |
|---|---|
| Site name, newsletter URL, contact email, social links | `src/consts.ts` |
| The 8 roadmap tracks | `src/data/tracks.ts` |
| Book parts and planned chapter counts | `src/data/book.ts` |
| Cohort, toolkits and workshops copy | `src/pages/work.astro` |
| About page and investments | `src/pages/about.astro` |
| Colors and fonts | `src/styles/global.css`, `astro.config.mjs` |
| Redirects from the old MkDocs URLs | `astro.config.mjs` |

## Commands

| Command | |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Local preview at http://localhost:4321 |
| `npm run new "Title"` | Create a private draft (in the drafts repo) |
| `npm run publish <slug>` | Move a draft onto the site |
| `npm run build` | Build the site into `dist/` |

In Superset workspaces, setup installs dependencies automatically and **Run** starts the dev server on a free port (see `.superset/`).

**Unpublish:** move the file to `src/content/archive/` (not built, kept for reference) and add a redirect for its URL in `astro.config.mjs` so old links don't break.
