/**
 * Copy every nnsight.net docs page into this repo, word for word, as clean
 * blocks the site renders in its own design. NDIF approved moving their
 * content here, so the output is committed and the build never fetches
 * nnsight.net.
 *
 *   bun scripts/import-docs.ts          re-import every page in the sitemap
 *   bun scripts/import-docs.ts --nav    refresh src/content/docs-nav.json (menu labels + paths)
 *
 * Once nnsight.net serves this site, build the MkDocs docs to any other URL
 * and point the importer there: DOCS_ORIGIN=https://docs-preview.example bun scripts/import-docs.ts
 *
 * Pages land in src/content/docs/, images and chart data in public/docs-media/.
 * Every link to nnsight.net is rewritten to this site; links that match no
 * page are reported and turned into plain text.
 */
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";
import katex from "katex";
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile, rm } from "node:fs/promises";
import { dirname, join } from "node:path";

/** Where the MkDocs build is served. Links to either address count as this site. */
const ORIGIN = (process.env.DOCS_ORIGIN ?? "https://nnsight.net").replace(/\/+$/, "");
const SITE = "https://nnsight.net";
const isOwn = (url: URL) => url.origin === ORIGIN || url.origin === SITE;
const ROOT = join(import.meta.dir, "..");
const NAV_FILE = join(ROOT, "src/content/docs-nav.json");
const OUT_DIR = join(ROOT, "src/content/docs");
const MEDIA_DIR = join(ROOT, "public/docs-media");
const MEDIA_URL = "/docs-media";
const CACHE_DIR = join(ROOT, "node_modules/.cache/nnsight-docs");

const SECTIONS = ["getting-started", "documentation", "features", "vllm", "tutorials"];
/** Pages this site builds by hand: the home page, the blog and the live status board. */
const OWN_PAGES = (p: string) => p === "/" || p === "/status" || p === "/blog" || p.startsWith("/blog/");

type NavLink = { label: string; path: string; own?: boolean; children?: NavLink[] };
type TocItem = { id: string; label: string; depth: number };
/** Body blocks, the same kinds the blog renders (see DocsSegments.astro). */
export type Seg =
  | { type: "html"; html: string }
  | { type: "code"; lang: string; code: string }
  | { type: "output"; text: string }
  | { type: "figure"; src: string; alt: string }
  | { type: "plotly"; src: string; height: number }
  | { type: "note"; title: string; children: Seg[] }
  | { type: "details"; summary: string; children: Seg[] };
type DocPage = {
  path: string;
  section: string;
  title: string;
  description: string;
  toc: TocItem[];
  segments: Seg[];
};

const BLOCKS = "div.doc-code, aside.doc-callout, details, pre.doc-output, div.doc-plotly";

/** Split converted HTML into blog-style blocks; plain wrappers are flattened. */
function segmentize($: cheerio.CheerioAPI, nodes: AnyNode[]): Seg[] {
  const out: Seg[] = [];
  let buf = "";
  const flush = () => {
    if (buf.trim()) out.push({ type: "html", html: buf.trim() });
    buf = "";
  };
  for (const node of nodes) {
    if (node.type !== "tag") {
      buf += $.html(node);
      continue;
    }
    const $n = $(node);
    const onlyImg = $n.children().length === 1 && $n.children("img").length === 1 && !$n.text().trim();
    if ($n.is("div.doc-code")) {
      flush();
      out.push({ type: "code", lang: $n.attr("data-lang") ?? "python", code: $n.find("pre").text().replace(/\n+$/, "") });
    } else if ($n.is("div.doc-plotly")) {
      flush();
      out.push({ type: "plotly", src: $n.attr("data-src")!, height: Number($n.attr("data-height") ?? 450) });
    } else if ($n.is("aside.doc-callout")) {
      flush();
      const t = $n.children(".doc-callout-title").first();
      const title = t.html() ?? "";
      t.remove();
      out.push({ type: "note", title, children: segmentize($, $n.contents().toArray()) });
    } else if ($n.is("details")) {
      flush();
      const s = $n.children("summary").first();
      const summary = s.html() ?? "";
      s.remove();
      out.push({ type: "details", summary, children: segmentize($, $n.contents().toArray()) });
    } else if ($n.is("pre.doc-output")) {
      flush();
      out.push({ type: "output", text: $n.text().replace(/\n+$/, "") });
    } else if (($n.is("p") || $n.is("div")) && onlyImg) {
      flush();
      const img = $n.children("img");
      out.push({ type: "figure", src: img.attr("src") ?? "", alt: img.attr("alt") ?? "" });
    } else if ($n.is("div") && $n.find(`${BLOCKS}, img`).length) {
      flush();
      out.push(...segmentize($, $n.contents().toArray()));
    } else {
      buf += $.html(node);
    }
  }
  flush();
  return out;
}

/** "/features/1_getting/" or "features/1_getting" -> "/features/1_getting" */
function normPath(p: string) {
  const clean = ("/" + p.replace(/^\/+/, "")).replace(/\/index\.html$/, "/").replace(/\/+$/, "");
  return clean || "/";
}

const fileKey = (path: string) => (path === "/" ? "index" : path.slice(1).replaceAll("/", "__"));

async function fetchText(path: string): Promise<string> {
  const key = join(CACHE_DIR, fileKey(path) + ".html");
  if (!process.env.NO_CACHE) {
    try {
      return await readFile(key, "utf8");
    } catch {}
  }
  const res = await fetch(ORIGIN + (path === "/" ? "/" : path + "/"), {
    headers: { "User-Agent": "nnsight-site-importer" },
  });
  if (!res.ok) throw new Error(`${res.status} fetching ${path}`);
  const text = await res.text();
  await mkdir(dirname(key), { recursive: true });
  await writeFile(key, text);
  return text;
}

async function sitemapPaths(): Promise<string[]> {
  const res = await fetch(ORIGIN + "/sitemap.xml", { headers: { "User-Agent": "nnsight-site-importer" } });
  if (!res.ok) throw new Error(`${res.status} fetching sitemap`);
  const xml = await res.text();
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => normPath(new URL(m[1]).pathname));
}

// ---------- nav ----------

function parseNavList($: cheerio.CheerioAPI, ul: cheerio.Cheerio<AnyNode>, base: string): NavLink[] {
  const out: NavLink[] = [];
  ul.children("li").each((_, li) => {
    const $li = $(li);
    const label =
      $li.children("label").first().text().trim().replace(/\s+/g, " ") ||
      $li.children("a").first().text().trim().replace(/\s+/g, " ") ||
      $li.find("> div > a, > a").first().text().trim().replace(/\s+/g, " ");
    // A folder has its own page only if it links directly (not via a child).
    const ownHref =
      $li.children("a").first().attr("href") ??
      $li.children(".md-nav__container").children("a").first().attr("href");
    const sub = $li.children("nav").children("ul").first();
    const children = sub.length ? parseNavList($, sub, base) : undefined;
    const ownPath = ownHref ? normPath(new URL(ownHref, ORIGIN + base).pathname) : undefined;
    // Section index pages repeat as the first child; fold them into the parent.
    if (ownPath && children?.length && children[0].path === ownPath) children.shift();
    const path = ownPath ?? children?.[0]?.path ?? "/";
    out.push({
      label,
      path,
      ...(children?.length ? { children, own: Boolean(ownPath) } : {}),
    });
  });
  return out;
}

async function refreshNav() {
  const $ = cheerio.load(await fetchText("/"));
  const top = $("nav.md-nav--primary > ul.md-nav__list").first();
  const all = parseNavList($, top, "/");
  const nav: Record<string, NavLink> = {};
  for (const item of all) {
    const key = item.path.slice(1);
    if (SECTIONS.includes(key)) nav[key] = item;
  }
  await writeFile(NAV_FILE, JSON.stringify(nav, null, 2) + "\n");
  console.log(`nav: ${Object.keys(nav).join(", ")} -> ${NAV_FILE}`);
}

// ---------- links ----------

const linkLog = { fuzzy: new Map<string, string>(), dead: new Map<string, string[]>() };

/** Links already broken on nnsight.net, pointed at the page they mean. */
const LINK_FIXES: Record<string, string> = {
  "/usage/source": "/features/11_source",
  "/documentation/usage/source": "/features/11_source",
  "/documentation/usage/trace": "/documentation/tracing/tracer",
  "/models/vllm": "/vllm",
  "/notebooks/features/remote_execution": "/features/15_remote_execution",
  "/features/blog/posts/vllm-integration": "/blog/2026/07/13/nnsight--vllm-interpretability-at-production-scale",
};

/** Outside links that went dead after the docs were written, pointed at where the page moved. */
const EXTERNAL_LINK_FIXES: Record<string, string> = {
  "https://docs.vllm.ai/en/latest/serving/distributed_serving.html":
    "https://docs.vllm.ai/en/latest/serving/parallelism_scaling.html",
};

/** Images missing on nnsight.net itself, replaced by this site's copy. */
const IMAGE_FIXES: Record<string, string> = {
  "/_static/images/nnsight_logo.svg": "/media/666a8a64-logo.svg",
};

/** Outside images that 404 on nnsight.net too; fetched from where the file lives now and served from here. */
const OLD_WEBSITE_IMAGES = "https://github.com/ndif-team/nnsight-website/blob/docs/source/notebooks/tutorials/images/";
const NEW_WEBSITE_IMAGES = "https://raw.githubusercontent.com/ndif-team/nnsight-website/HEAD/docs/tutorials/tutorials/images/";

const stripSource = (pathname: string) =>
  normPath(pathname.replace(/\/index\.(md|ipynb|html)$/, "/").replace(/\.(md|ipynb|html)$/, ""));

/**
 * Where an nnsight.net link lives on this site. Handles the page itself,
 * Markdown/notebook source names (`../documentation/modeling/transformers.md`,
 * which the original site leaves relative to the notebook file, not the page
 * URL), and paths written relative to the wrong folder, by matching the path's
 * tail against every known page. Returns null when nothing matches.
 */
function resolveLocal(url: URL, known: Set<string>, sourceUrl?: URL): string | null {
  const hash = url.hash;
  const fromSource = sourceUrl && stripSource(sourceUrl.pathname);
  if (fromSource && known.has(fromSource)) return fromSource + hash;
  const p = stripSource(url.pathname);
  const fixed = LINK_FIXES[p] ?? (fromSource && LINK_FIXES[fromSource]);
  if (fixed) return fixed + hash;
  if (known.has(p) || OWN_PAGES(p)) return p + hash;
  const segs = p.split("/").filter(Boolean);
  for (let k = segs.length - 1; k >= 1; k--) {
    const tail = "/" + segs.slice(-k).join("/");
    const hits = [...known].filter((x) => x.endsWith(tail));
    if (hits.length === 1) {
      linkLog.fuzzy.set(url.pathname, hits[0]);
      return hits[0] + hash;
    }
    if (hits.length > 1) break;
  }
  return null;
}

// ---------- page conversion ----------

const KEEP_CLASS = /^(doc-|language-|twemoji|arithmatex)/;

/** Read one JSON value starting at `i` (strings, nesting and escapes aware). */
function readJsonValue(src: string, i: number): [unknown, number] {
  while (/\s|,/.test(src[i])) i++;
  const start = i;
  if (src[i] === '"') {
    i++;
    while (src[i] !== '"') i += src[i] === "\\" ? 2 : 1;
    return [JSON.parse(src.slice(start, i + 1)), i + 1];
  }
  let depth = 0;
  let inStr = false;
  for (; i < src.length; i++) {
    const c = src[i];
    if (inStr) {
      if (c === "\\") i++;
      else if (c === '"') inStr = false;
      continue;
    }
    if (c === '"') inStr = true;
    else if (c === "{" || c === "[") depth++;
    else if (c === "}" || c === "]") {
      depth--;
      if (depth === 0) return [JSON.parse(src.slice(start, i + 1)), i + 1];
    }
  }
  throw new Error("unterminated JSON value");
}

async function saveMedia(rel: string, bytes: Uint8Array) {
  const file = join(MEDIA_DIR, rel);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, bytes);
  return `${MEDIA_URL}/${rel}`;
}

async function convert(path: string, html: string, known: Set<string>): Promise<DocPage> {
  const $ = cheerio.load(html);
  const art = $("article.md-content__inner").first();
  if (!art.length) throw new Error(`no article on ${path}`);
  const pageUrl = ORIGIN + path + "/";
  const key = fileKey(path);

  // Plotly charts: keep the figure data as a JSON file, drawn by the page's chart loader.
  let chart = 0;
  for (const el of art.find(".jp-OutputArea-output").toArray()) {
    const $el = $(el);
    const script = $el
      .find("script")
      .toArray()
      .map((s) => $(s).html() ?? "")
      .find((s) => /Plotly\.newPlot\(\s*"/.test(s));
    if (!script) continue;
    const call = /Plotly\.newPlot\(\s*/.exec(script.slice(script.search(/Plotly\.newPlot\(\s*"/)))!;
    const i = script.search(/Plotly\.newPlot\(\s*"/) + call[0].length;
    const [, a] = readJsonValue(script, i);
    const [data, b] = readJsonValue(script, a);
    const [layout, c] = readJsonValue(script, b);
    let config: unknown = {};
    try {
      [config] = readJsonValue(script, c);
    } catch {}
    const height = Number(/height:\s*(\d+)px/.exec($el.html() ?? "")?.[1] ?? (layout as { height?: number })?.height ?? 450);
    const src = await saveMedia(
      `plotly/${key}-${++chart}.json`,
      new TextEncoder().encode(JSON.stringify({ data, layout, config })),
    );
    $el.replaceWith(`<div class="doc-plotly" data-src="${src}" data-height="${height}"></div>`);
  }

  art
    .find(
      "a.headerlink, a.anchor-link, .md-content__button, .md-source-file, style, clipboard-copy, .clipboard-copy-txt, .clipboard-copy-icon, .zeroclipboard-container",
    )
    .remove();
  art.find(".jp-InputPrompt, .jp-OutputPrompt, .jp-Collapser, .jp-InputArea-prompt, .jp-OutputArea-prompt").remove();
  art.find("script").remove();

  const h1 = art.find("h1").first();
  const title = h1.text().replace(/¶/g, "").trim() || $("title").text().replace(/\s+-\s+nnsight\s*$/i, "").trim();
  h1.remove();

  // Code blocks (Markdown fences, notebook inputs, API signatures) -> one shape.
  art.find("div.highlight, div.highlight-ipynb").each((_, el) => {
    const $el = $(el);
    const pre = $el.find("td.code pre, pre").last();
    const cls = ($el.attr("class") ?? "") + " " + ($el.parent().attr("class") ?? "");
    const lang = /language-(\w+)/.exec(cls)?.[1] ?? /hl-(\w+)/.exec(cls)?.[1] ?? "python";
    const code = pre.find("code").length ? pre.find("code").html() : pre.html();
    $el.replaceWith(`<div class="doc-code" data-lang="${lang}"><pre><code>${code ?? ""}</code></pre></div>`);
  });

  // Notebook outputs: plain text becomes an output block; images, tables and SVG stay.
  art.find(".jp-OutputArea-output").each((_, el) => {
    const $el = $(el);
    const pre = $el.children("pre");
    if (pre.length && !$el.find("img, table, svg").length) {
      $el.replaceWith(`<pre class="doc-output">${pre.html() ?? ""}</pre>`);
    } else if (!$el.text().trim() && !$el.find("img, table, svg, .doc-plotly").length) {
      $el.remove();
    }
  });

  // Admonitions and collapsible notes -> callouts.
  art.find("div.admonition").each((_, el) => {
    const $el = $(el);
    const kind = ($el.attr("class") ?? "").split(/\s+/).find((c) => c !== "admonition") ?? "note";
    $el.find("p.admonition-title").first().each((__, t) => {
      $(t).replaceWith(`<p class="doc-callout-title">${$(t).html()}</p>`);
    });
    $el.replaceWith(`<aside class="doc-callout" data-kind="${kind}">${$el.html()}</aside>`);
  });

  // Emoji images back to the emoji itself.
  art.find("img.twemoji, img.emojione").each((_, el) => {
    $(el).replaceWith($(el).attr("alt") ?? "");
  });

  // Links stay on this site; dead nnsight.net links become plain text.
  art.find("a[href]").each((_, el) => {
    // Fix Markdown slips on the original: "(https://...)" and bare domains.
    const href = $(el)
      .attr("href")!
      .trim()
      .replace(/^\((.*)\)$/, "$1")
      .replace(/^(?=[a-z0-9-]+(\.[a-z0-9-]+)*\.(us|com|org|net|io|ai)(\/|$))/i, "https://");
    if (href.startsWith("#") || href.startsWith("mailto:")) return;
    let url: URL;
    try {
      url = new URL(href, pageUrl);
    } catch {
      return;
    }
    if (!isOwn(url)) {
      const fixed = EXTERNAL_LINK_FIXES[href] ?? href;
      if (fixed !== $(el).attr("href")) $(el).attr("href", fixed);
      return;
    }
    const isSource = /\.(md|ipynb)$/.test(url.pathname);
    const next = resolveLocal(url, known, isSource ? new URL(href, ORIGIN + path) : undefined);
    if (next) {
      $(el).attr("href", next);
      // Link text that spells out an old nnsight.net address shows the new one.
      const text = $(el).text().trim();
      if (!$(el).children().length && /^(https?:\/\/)?nnsight\.net\//.test(text)) {
        $(el).text(text.replace(/nnsight\.net\/.*$/, "nnsight.net" + next));
      }
    } else {
      linkLog.dead.set(url.pathname, [...(linkLog.dead.get(url.pathname) ?? []), path]);
      $(el).replaceWith($(el).html() ?? "");
    }
  });

  // Images: copy nnsight.net files and inline data into this site.
  let inline = 0;
  for (const el of art.find("img[src]").toArray()) {
    const src = $(el).attr("src")!;
    if (src.startsWith("data:")) {
      const m = /^data:image\/([\w+]+);base64,(.*)$/s.exec(src);
      if (m) {
        const ext = m[1] === "svg+xml" ? "svg" : m[1] === "jpeg" ? "jpg" : m[1];
        const bytes = Uint8Array.from(Buffer.from(m[2], "base64"));
        const hash = createHash("sha1").update(bytes).digest("hex").slice(0, 10);
        $(el).attr("src", await saveMedia(`inline/${key}-${++inline}-${hash}.${ext}`, bytes));
      }
    } else {
      const abs = new URL(src, pageUrl);
      if (IMAGE_FIXES[abs.pathname]) $(el).attr("src", IMAGE_FIXES[abs.pathname]);
      else if (src.startsWith(OLD_WEBSITE_IMAGES)) {
        const name = src.slice(OLD_WEBSITE_IMAGES.length).replace(/\?.*$/, "");
        const res = await fetch(NEW_WEBSITE_IMAGES + name);
        if (res.ok) $(el).attr("src", await saveMedia(`assets/images/${name}`, new Uint8Array(await res.arrayBuffer())));
        else console.warn(`docs: missing image ${name} on ${path}`);
      } else if (isOwn(abs)) {
        abs.protocol = new URL(ORIGIN).protocol;
        abs.host = new URL(ORIGIN).host;
        const res = await fetch(abs);
        if (res.ok) $(el).attr("src", await saveMedia(abs.pathname.slice(1), new Uint8Array(await res.arrayBuffer())));
        else console.warn(`docs: missing image ${abs.pathname} on ${path}`);
      }
    }
    $(el).attr("loading", "lazy");
  }

  // Unwrap notebook containers, then drop presentational classes (SVG keeps its own).
  for (let pass = 0; pass < 8; pass++) {
    art.find('div[class*="jp-"], div.jupyter-wrapper').each((_, el) => {
      $(el).replaceWith($(el).html() ?? "");
    });
  }
  art.find("[class]").each((_, el) => {
    const $el = $(el);
    if ($el.closest("svg").length && el.tagName !== "svg") return;
    if ($el.closest(".doc-code").length && el.tagName === "span") return; // syntax colors
    const keep = ($el.attr("class") ?? "").split(/\s+/).filter((c) => KEEP_CLASS.test(c));
    if (keep.length) $el.attr("class", keep.join(" "));
    else $el.removeAttr("class");
  });
  art.find("[style]").each((_, el) => {
    if (!$(el).closest("svg").length) $(el).removeAttr("style");
  });

  // Math: typeset once here with KaTeX, so pages need no math script.
  art.find(".arithmatex").each((_, el) => {
    const $el = $(el);
    const raw = $el.text().trim();
    const display = el.tagName === "div" || raw.startsWith("\\[") || raw.startsWith("$$");
    const tex = raw
      .replace(/^\\\(|\\\)$/g, "")
      .replace(/^\\\[|\\\]$/g, "")
      .replace(/^\$\$|\$\$$/g, "");
    const out = katex.renderToString(tex, { displayMode: display, throwOnError: false, strict: false, output: "html" });
    $el.replaceWith(display ? `<div class="doc-math">${out}</div>` : out);
  });

  const toc: TocItem[] = [];
  art.find("h2[id], h3[id]").each((_, el) => {
    toc.push({ id: $(el).attr("id")!, label: $(el).text().replace(/¶/g, "").trim(), depth: el.tagName === "h2" ? 2 : 3 });
  });

  return {
    path,
    section: path.split("/")[1],
    title,
    description: $('meta[name="description"]').attr("content") ?? "",
    toc,
    segments: segmentize($, art.contents().toArray()),
  };
}

async function importPages() {
  const paths = (await sitemapPaths()).filter((p) => !OWN_PAGES(p));
  const known = new Set(paths);

  await rm(OUT_DIR, { recursive: true, force: true });
  await rm(MEDIA_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  const index: Omit<DocPage, "segments" | "toc">[] = [];
  let failed = 0;
  for (const path of paths) {
    try {
      const page = await convert(path, await fetchText(path), known);
      const json = JSON.stringify(page);
      await writeFile(join(OUT_DIR, fileKey(path) + ".json"), json);
      const { segments, toc, ...meta } = page;
      index.push(meta);
      console.log(`docs: ${path}  (${segments.length} blocks, ${Math.round(json.length / 1024)} KB)`);
    } catch (err) {
      failed++;
      console.error(`docs: FAILED ${path}: ${(err as Error).stack}`);
    }
  }
  await writeFile(join(OUT_DIR, "index.json"), JSON.stringify({ pages: index }, null, 2) + "\n");
  console.log(`\n${index.length} pages imported, ${failed} failed`);
  for (const [from, to] of linkLog.fuzzy) console.log(`link fixed: ${from} -> ${to}`);
  for (const [dead, on] of linkLog.dead) console.log(`link DEAD (now text): ${dead}  on ${[...new Set(on)].join(", ")}`);
  if (failed) process.exit(1);
}

if (process.argv.includes("--nav")) await refreshNav();
else await importPages();
