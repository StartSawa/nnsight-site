# nnsight.net

The NNsight website: homepage, blog, live NDIF status, and every docs page from nnsight.net (Getting Started, Documentation, Features, vLLM, Tutorials, About), copied word for word into one design.

It is a static site built with Astro 6, React 19, Tailwind CSS v4 and TypeScript. The build makes plain HTML, CSS and JS in `dist/`, so any static host can serve it.

## Run it locally

You need [Bun](https://bun.sh) (version in `.bun-version`).

```bash
bun install
bun run dev        # http://localhost:3000
```

## Build

```bash
bun run build      # output in dist/
bun run preview    # serves the built site locally
```

Windows note: build from a path that starts with `C:\` (for example in PowerShell). A lowercase `c:\` path makes Astro skip the stylesheet.

## Put it on nnsight.net

On Vercel:

1. Push this folder to a GitHub repo and import it as a Vercel project.
2. `vercel.json` already sets the Astro preset, `bun install`, `bun run build` and the `dist` output. Every push deploys.
3. Add `nnsight.net` under the project's Settings, Domains, and follow the DNS steps Vercel shows.

Any other static host works too (Netlify, Cloudflare Pages, GitHub Pages): run `bun run build` and serve `dist/`. Turn on clean URLs, so `/features/1_getting` serves `features/1_getting/index.html`.

Old links keep working. Every docs page sits at the same path it had on nnsight.net, and addresses with a trailing slash redirect to the same page without it.

Search engines: any `*.vercel.app` address is sent `X-Robots-Tag: noindex` (see `vercel.json`), so previews stay out of Google. The real domain is indexable. Canonical URLs and the sitemap already point at `https://nnsight.net`.

## The docs pages

Every docs page lives in this repo as JSON in `src/content/docs/`, with its images and chart data in `public/docs-media/`. The build never fetches anything from outside. `src/pages/[...slug].astro` renders each page in `src/components/docs/DocsShell.astro`: the section menu on the left (from `src/content/docs-nav.json`), the page, and its table of contents on the right.

To update the docs, keep writing them in the MkDocs source as today, then copy the built pages in:

```bash
# while nnsight.net still serves the MkDocs site:
bun scripts/import-docs.ts --nav   # menu labels and order
bun scripts/import-docs.ts         # every page in the sitemap

# once nnsight.net serves this site, point it at wherever the MkDocs build is served:
DOCS_ORIGIN=https://docs-preview.example.com bun scripts/import-docs.ts
```

The importer rewrites every nnsight.net link to a path on this site, copies images and charts into `public/docs-media/`, typesets math with KaTeX, and reports any link it can't place. Then check the result:

```bash
python scripts/qa/check_links.py dist [--external]   # every link and image resolves; nothing points at an old address
python scripts/qa/check_coverage.py                  # every word of every source page is on the built page
```

## The blog

All posts live in `src/content/blog-posts.json`, one object per post.

- `body` is Markdown. A few extra markers place the custom pieces:
  - `::viz <name>` places an interactive figure from `src/components/sections/blog/post-viz.tsx`.
  - `:::note Title` ... `:::` makes a note box.
  - `:::details Summary` ... `:::` makes an expandable section.
- `authors` is a JSON string: a list of `{ name, role, avatar }`.
- `subtitle` shows under the title on the post page (optional).
- Set `"draft": 1` to hide a post on the built site.
- A post's URL is `/blog/YYYY/MM/DD/<slug>`, from `pubDate` and `slug`.

## The status page

`/status` reads `https://api.ndif.us/status` in the visitor's browser (`src/components/pages/status/status-board.tsx`), so it is always live and needs no build.

## Where things are

- `src/pages/`: routes. `index.astro` (homepage), `blog/`, `status.astro`, `[...slug].astro` (all docs pages).
- `src/components/`: sections and UI components. `docs/` is the docs layout.
- `src/styles/globals.css`: colours, fonts (Geist for the site, IBM Plex for the blog and docs) and theme tokens.
- `public/`: fonts, images, docs media, `vendor/plotly-2.35.2.min.js` for the notebook charts, and `vendor/three-r134.min.js` plus `vendor/vanta.dots-0.5.24.min.js` for the home page's moving dots.
