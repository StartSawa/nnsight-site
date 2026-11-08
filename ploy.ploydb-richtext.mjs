/**
 * Fixed PloyDB rich-text renderer, shipped into every tenant site by the
 * sandbox image (copied to the project root as `ploy.ploydb-richtext.mjs`).
 * Do not edit: the sandbox regenerates it from the image on every boot.
 *
 *   import { renderRichText } from "../../ploy.ploydb-richtext.mjs";
 *   <div set:html={renderRichText(post.body)} />
 *
 * Cells are semi-trusted (a public form handler can write to one), so this is
 * the security boundary: raw HTML disabled, link schemes allowlisted, embeds
 * rebuilt from an id. Requires `markdown-it`; inert until imported, so sites
 * without rich text never need it.
 *
 * `VIDEO_PROVIDERS` duplicates `@ploy/core`'s `ploydb/rich-text.ts` because
 * this file ships outside the workspace. Edit one, edit both — ploy-app's
 * `rich-text-allowlist-drift.test.ts` deep-equals them.
 */

import MarkdownIt from "markdown-it";

/* eslint-disable -- shipped verbatim into tenant sites; not linted by ploy-app */

export const VIDEO_PROVIDERS = {
  youtube: {
    label: "YouTube",
    hosts: [
      "youtube.com",
      "www.youtube.com",
      "m.youtube.com",
      "youtube-nocookie.com",
      "www.youtube-nocookie.com",
      "youtu.be",
      "www.youtu.be",
    ],
    bareIdHosts: ["youtu.be", "www.youtu.be"],
    searchParams: ["v"],
    pathPatterns: [
      "^/embed/([^/?#]+)",
      "^/shorts/([^/?#]+)",
      "^/live/([^/?#]+)",
      "^/v/([^/?#]+)",
    ],
    idPattern: "^[A-Za-z0-9_-]{11}$",
    embedUrlPrefix: "https://www.youtube-nocookie.com/embed/",
    watchUrlPrefix: "https://youtu.be/",
  },
  vimeo: {
    label: "Vimeo",
    hosts: ["vimeo.com", "www.vimeo.com", "player.vimeo.com"],
    bareIdHosts: [],
    searchParams: [],
    pathPatterns: [
      "^/video/([0-9]+)",
      "^/channels/[^/]+/([0-9]+)",
      "^/groups/[^/]+/videos/([0-9]+)",
      "^/([0-9]+)",
    ],
    idPattern: "^[0-9]{6,12}$",
    embedUrlPrefix: "https://player.vimeo.com/video/",
    watchUrlPrefix: "https://vimeo.com/",
  },
  loom: {
    label: "Loom",
    hosts: ["loom.com", "www.loom.com"],
    bareIdHosts: [],
    searchParams: [],
    pathPatterns: ["^/share/([^/?#]+)", "^/embed/([^/?#]+)"],
    idPattern: "^[A-Za-z0-9]{24,40}$",
    embedUrlPrefix: "https://www.loom.com/embed/",
    watchUrlPrefix: "https://www.loom.com/share/",
  },
};

export const CALLOUT_KINDS = ["note", "tip", "important", "warning", "caution"];

const CALLOUT_LABELS = {
  note: "Note",
  tip: "Tip",
  important: "Important",
  warning: "Warning",
  caution: "Caution",
};

const SAFE_SCHEMES = new Set(["http:", "https:", "mailto:", "tel:"]);

const STRIPPED_BEFORE_SCHEME =
  /[\u0000-\u0020\u007f-\u00a0\u2000-\u200f\u2028-\u202f\ufeff]/g;

/**
 * Mirrors `isSafeHref` in `@ploy/core`. Stricter than markdown-it's default
 * `validateLink`, which permits `data:image/*`.
 * @param {unknown} href
 */
export function isSafeHref(href) {
  if (typeof href !== "string") return false;
  const trimmed = href.trim();
  if (!trimmed) return false;

  const normalized = trimmed.replace(STRIPPED_BEFORE_SCHEME, "");
  if (!normalized) return false;

  const schemeEnd = normalized.indexOf(":");
  if (schemeEnd > 0) {
    const beforeScheme = normalized.slice(0, schemeEnd);
    if (!/[/?#]/.test(beforeScheme)) {
      return SAFE_SCHEMES.has(`${beforeScheme.toLowerCase()}:`);
    }
  }
  return true;
}

/**
 * Player URL built from the id alone; a stored URL never reaches the iframe.
 * @param {unknown} provider
 * @param {unknown} id
 */
export function videoEmbedUrl(provider, id) {
  if (typeof provider !== "string" || !(provider in VIDEO_PROVIDERS)) {
    return null;
  }
  if (typeof id !== "string" || !id) return null;
  const spec = VIDEO_PROVIDERS[provider];
  if (!new RegExp(spec.idPattern).test(id)) return null;
  return `${spec.embedUrlPrefix}${encodeURIComponent(id)}`;
}

/**
 * Resolve a watch/share URL to `{ provider, id }`; the URL itself is discarded.
 * @param {unknown} url
 */
/**
 * `new URL()` keeps a malformed escape (`/%`) verbatim, so decoding one throws.
 * A cell is semi-trusted input; a throw here would take down the whole render.
 */
function decodeSegment(segment) {
  try {
    return decodeURIComponent(segment);
  } catch {
    return null;
  }
}

export function parseVideoUrl(url) {
  if (typeof url !== "string" || !url.trim()) return null;

  let parsed;
  try {
    parsed = new URL(url.trim());
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return null;

  const host = parsed.hostname.toLowerCase();
  for (const providerId of Object.keys(VIDEO_PROVIDERS)) {
    const provider = VIDEO_PROVIDERS[providerId];
    if (!provider.hosts.includes(host)) continue;

    const candidates = [];
    const addDecoded = (segment) => {
      const decoded = decodeSegment(segment);
      if (decoded !== null) candidates.push(decoded);
    };
    if (provider.bareIdHosts.includes(host)) {
      addDecoded(parsed.pathname.replace(/^\//, ""));
    }
    for (const param of provider.searchParams) {
      const value = parsed.searchParams.get(param);
      if (value) candidates.push(value);
    }
    for (const pattern of provider.pathPatterns) {
      const match = new RegExp(pattern).exec(parsed.pathname);
      if (match?.[1]) addDecoded(match[1]);
    }

    for (const candidate of candidates) {
      if (new RegExp(provider.idPattern).test(candidate)) {
        return { provider: providerId, id: candidate };
      }
    }
    return null;
  }
  return null;
}

const HTML_ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

function escapeHtml(value) {
  return String(value ?? "").replace(/[&<>"']/g, (ch) => HTML_ESCAPES[ch]);
}

const CALLOUT_MARKER = /^\[!([A-Za-z]+)\][ \t]*$/;

/** `> [!NOTE]` → a tagged blockquote. Ordinary quotes are left untouched. */
function githubAlerts(md) {
  md.core.ruler.push("ploy_github_alerts", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "blockquote_open") continue;
      if (tokens[i + 1]?.type !== "paragraph_open") continue;
      const inline = tokens[i + 2];
      if (inline?.type !== "inline") continue;

      const newline = inline.content.indexOf("\n");
      const firstLine =
        newline === -1 ? inline.content : inline.content.slice(0, newline);
      const marker = CALLOUT_MARKER.exec(firstLine.trim());
      if (!marker) continue;
      const kind = marker[1].toLowerCase();
      if (!CALLOUT_KINDS.includes(kind)) continue;

      tokens[i].attrSet("data-callout", kind);
      inline.content = newline === -1 ? "" : inline.content.slice(newline + 1);
      // Drop the marker text token and the softbreak after it.
      const children = inline.children ?? [];
      let drop = children[0]?.type === "text" ? 1 : 0;
      if (children[drop]?.type === "softbreak") drop++;
      inline.children = children.slice(drop);

      // A bodyless callout would otherwise render an empty <p>.
      if (inline.children.length === 0) {
        tokens[i + 1].hidden = true;
        inline.hidden = true;
        if (tokens[i + 3]?.type === "paragraph_close") {
          tokens[i + 3].hidden = true;
        }
      }
    }
  });
}

/**
 * A paragraph holding nothing but a bare allowlisted video URL IS the embed.
 * An explicit `[label](url)` stays a link — that is the escape hatch, and how
 * the editor's "convert to link" survives a round trip.
 */
function soleVideoRef(inline) {
  return parseVideoUrl(inline.content.trim().replace(/^<|>$/g, ""));
}

function videoEmbeds(md) {
  md.core.ruler.push("ploy_video_embeds", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length - 2; i++) {
      if (tokens[i].type !== "paragraph_open") continue;
      if (tokens[i + 1]?.type !== "inline") continue;
      if (tokens[i + 2]?.type !== "paragraph_close") continue;

      const ref = soleVideoRef(tokens[i + 1]);
      if (!ref) continue;

      tokens[i].type = "ploy_video";
      tokens[i].meta = ref;
      tokens[i + 1].children = [];
      tokens[i + 1].content = "";
      tokens[i + 2].hidden = true;
    }
  });

  md.renderer.rules.ploy_video = (tokens, idx) => {
    const { provider, id } = tokens[idx].meta;
    const src = videoEmbedUrl(provider, id);
    if (!src) return "";
    const label = VIDEO_PROVIDERS[provider].label;
    return (
      `<figure class="ploy-video" data-provider="${escapeHtml(provider)}">` +
      `<iframe src="${escapeHtml(src)}" title="${label} video" loading="lazy"` +
      ` width="560" height="315" frameborder="0" allowfullscreen` +
      ` referrerpolicy="strict-origin-when-cross-origin"` +
      ` allow="accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture"` +
      `></iframe></figure>`
    );
  };
}

/** Plain text of an inline token, so `**Bold** title` labels as `Bold title`. */
function inlineText(inline) {
  let text = "";
  for (const child of inline.children ?? []) {
    if (child.type === "text" || child.type === "code_inline") {
      text += child.content;
    }
  }
  return text.trim();
}

/** Accent-folded, so a French heading anchors as ascii (`Réponse` → `reponse`). */
function slugifyHeading(text) {
  const slug = String(text ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || "section";
}

/** Suffixes until unused, so a repeated heading can't collide with an `-N` one. */
function uniqueHeadingId(slug, taken) {
  let candidate = slug;
  let next = 2;
  while (taken.has(candidate)) candidate = `${slug}-${next++}`;
  taken.add(candidate);
  return candidate;
}

/**
 * Give every heading an `id` and collect them on `env`, so a page builds a table
 * of contents from the same pass that rendered the anchors rather than by
 * re-parsing the HTML it just got back.
 */
function headingAnchors(md) {
  md.core.ruler.push("ploy_heading_anchors", (state) => {
    const headings = [];
    const taken = new Set();
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "heading_open") continue;
      const inline = tokens[i + 1];
      if (inline?.type !== "inline") continue;
      const label = inlineText(inline);
      const id = uniqueHeadingId(slugifyHeading(label), taken);
      tokens[i].attrSet("id", id);
      headings.push({ id, label, level: Number(tokens[i].tag.slice(1)) });
    }
    state.env.ployHeadings = headings;
  });
}

const TASK_MARKER = /^\[([ xX])\][ \t]+/;

/** GFM task lists. Stock markdown-it has no rule, so `[ ]` would render raw. */
function taskLists(md) {
  md.core.ruler.push("ploy_task_lists", (state) => {
    const tokens = state.tokens;
    for (let i = 0; i < tokens.length; i++) {
      if (tokens[i].type !== "list_item_open") continue;
      // A tight list hides its paragraph tokens but still emits them.
      const inline =
        tokens[i + 1]?.type === "paragraph_open"
          ? tokens[i + 2]
          : tokens[i + 1];
      if (inline?.type !== "inline") continue;
      const first = inline.children?.[0];
      if (first?.type !== "text") continue;
      const marker = TASK_MARKER.exec(first.content);
      if (!marker) continue;

      first.content = first.content.slice(marker[0].length);
      inline.content = inline.content.slice(marker[0].length);
      tokens[i].attrSet("data-task", marker[1] === " " ? "todo" : "done");
    }
  });

  md.renderer.rules.list_item_open = (tokens, idx, options, _env, self) => {
    const task = tokens[idx].attrGet("data-task");
    if (!task) return self.renderToken(tokens, idx, options);
    const checked = task === "done" ? " checked" : "";
    return (
      `<li class="ploy-task-item" data-task="${task}">` +
      `<input type="checkbox" disabled${checked}> `
    );
  };
}

function buildRenderer() {
  const md = new MarkdownIt({
    // Escapes raw HTML. The whole reason `set:html` on the output is safe.
    html: false,
    linkify: true,
    breaks: false,
    typographer: false,
  });

  md.validateLink = isSafeHref;

  md.use(githubAlerts);
  md.use(taskLists);
  md.use(videoEmbeds);
  md.use(headingAnchors);

  md.renderer.rules.blockquote_open = (tokens, idx, options, _env, self) => {
    const kind = tokens[idx].attrGet("data-callout");
    if (!kind) return self.renderToken(tokens, idx, options);
    const label = CALLOUT_LABELS[kind];
    return (
      `<blockquote class="ploy-callout ploy-callout-${kind}" data-callout="${kind}">` +
      `<p class="ploy-callout-label">${label}</p>`
    );
  };

  // markdown-it blanks a rejected src rather than dropping the image; drop it.
  md.renderer.rules.image = (tokens, idx, options, env, self) => {
    const token = tokens[idx];
    const src = token.attrGet("src");
    if (!isSafeHref(src)) return "";
    token.attrSet("loading", "lazy");
    token.attrs[token.attrIndex("alt")][1] = self.renderInlineAsText(
      token.children,
      options,
      env,
    );
    return self.renderToken(tokens, idx, options);
  };

  const defaultLinkOpen = (tokens, idx, options, _env, self) =>
    self.renderToken(tokens, idx, options);
  md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const href = tokens[idx].attrGet("href");
    if (/^https?:/i.test(href ?? "")) {
      tokens[idx].attrSet("rel", "noopener noreferrer nofollow");
    }
    return defaultLinkOpen(tokens, idx, options, env, self);
  };

  return md;
}

let renderer = null;
function getRenderer() {
  if (!renderer) renderer = buildRenderer();
  return renderer;
}

/**
 * Render a `LONG_TEXT` cell to HTML safe to `set:html`, plus the headings it
 * anchored — `[{ id, label, level }]` in document order, for a table of
 * contents. One pass, so the ids in the HTML and the ids in the list agree.
 * @param {unknown} markdown
 * @returns {{ html: string, headings: { id: string, label: string, level: number }[] }}
 */
export function renderRichTextWithHeadings(markdown) {
  if (typeof markdown !== "string" || !markdown.trim()) {
    return { html: "", headings: [] };
  }
  const env = {};
  const html = getRenderer().render(markdown, env);
  return { html, headings: env.ployHeadings ?? [] };
}

/**
 * Render a `LONG_TEXT` cell to HTML safe to `set:html`. `""` for a missing cell.
 * @param {unknown} markdown
 * @returns {string}
 */
export function renderRichText(markdown) {
  return renderRichTextWithHeadings(markdown).html;
}
