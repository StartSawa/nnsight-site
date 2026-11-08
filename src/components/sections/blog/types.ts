// Shared blog ids, types and helpers. Safe to import from React components
// (no server-only modules here).

export const BLOG_PLOYDB_ID = "pdb_ae6bf5ce7c844003a34c";
export const POSTS_TABLE = "tbl_6731815e084e42828404";

export const POSTS_FIELDS = {
  title: "fld_ecd328be6ee74996",
  slug: "fld_2577210c48854de8",
  pubDate: "fld_a2c8277883cc413c",
  dateLabel: "fld_0441ecf1b7ac4caf",
  category: "fld_ff667f8b839549e5",
  readTime: "fld_e68b450a55984610",
  description: "fld_43a11b85f06b49a2",
  authors: "fld_e88ff853af8c4f61",
  body: "fld_31d5addb854341b0",
  sourceUrl: "fld_35ef5f88f6044e09",
  draft: "fld_acbe1df0fc0a4130",
  subtitle: "fld_2679bb76f2cf4494",
} as const;

// The index needs each post's first code sample for its cover, so it reads
// the body too; only the cover lines are passed on to the page.
export const POSTS_LIST_FIELDS = POSTS_FIELDS;

export const CATEGORIES = ["Ecosystem", "Guide", "Release"] as const;

export type BlogAuthor = { name: string; role: string; avatar: string };

export type BlogPost = {
  id: string;
  title: string;
  /** Optional line under the title on the article page. */
  subtitle: string;
  slug: string;
  pubDate: string; // YYYY-MM-DD
  dateLabel: string;
  category: string;
  readTime: string;
  description: string;
  authors: BlogAuthor[];
  body: string;
  sourceUrl: string;
  path: string;
  cover: string;
  coverImage: string;
  coverAlt: string;
};

export function categorySlug(category: string) {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function categoryPath(category: string) {
  return `/blog/category/${categorySlug(category)}`;
}

export function postPath(pubDate: string, slug: string) {
  const [y, m, d] = pubDate.slice(0, 10).split("-");
  return `/blog/${y}/${m}/${d}/${slug}`;
}

function formatDate(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/** First Python code sample of a post, trimmed to a few lines for its cover. */
export function coverCode(body: string, maxLines = 9) {
  const m = /^```python\n([\s\S]*?)\n```/m.exec(body) ?? /^```\w*\n([\s\S]*?)\n```/m.exec(body);
  if (!m) return "";
  return m[1].split("\n").slice(0, maxLines).join("\n");
}

/** First standalone figure in a post body, used as its cover when present. */
export function coverFigure(body: string) {
  const m = /^!\[((?:[^\]\\]|\\.)*)\]\(((?:https:\/)?\/\S+?)\)\s*$/m.exec(body);
  return m ? { src: m[2], alt: m[1].replace(/\\(.)/g, "$1") } : { src: "", alt: "" };
}

function parseAuthors(raw: unknown): BlogAuthor[] {
  if (typeof raw !== "string" || !raw.trim()) return [];
  try {
    const list = JSON.parse(raw);
    return Array.isArray(list)
      ? list
          .filter((a) => a && typeof a.name === "string")
          .map((a) => ({
            name: String(a.name),
            role: String(a.role ?? ""),
            avatar: String(a.avatar ?? ""),
          }))
      : [];
  } catch {
    return [];
  }
}

export function parsePost(row: Record<string, unknown>): BlogPost {
  const pubDate = String(row.pubDate ?? "").slice(0, 10);
  const slug = String(row.slug ?? "");
  const body = String(row.body ?? "");
  return {
    id: String(row.id ?? slug),
    title: String(row.title ?? ""),
    subtitle: String(row.subtitle ?? ""),
    slug,
    pubDate,
    dateLabel: String(row.dateLabel ?? "") || formatDate(pubDate),
    category: String(row.category ?? ""),
    readTime: String(row.readTime ?? ""),
    description: String(row.description ?? ""),
    authors: parseAuthors(row.authors),
    body,
    sourceUrl: String(row.sourceUrl ?? ""),
    path: postPath(pubDate, slug),
    cover: coverCode(body),
    coverImage: coverFigure(body).src,
    coverAlt: coverFigure(body).alt,
  };
}

/** Newest first; same-day posts by slug, matching the original blog. */
export function sortPosts(posts: BlogPost[]) {
  return [...posts].sort(
    (a, b) => b.pubDate.localeCompare(a.pubDate) || a.slug.localeCompare(b.slug),
  );
}

/** Drop the body before handing posts to a list view. */
export function toListPost(post: BlogPost): BlogPost {
  return { ...post, body: "" };
}

export const PREVIEW_POSTS = [
  {
    id: "preview_1",
    title: "Blog post title 1",
    subtitle: "",
    slug: "blog-post-title-1",
    pubDate: "2026-01-02",
    dateLabel: "January 2, 2026",
    category: "Guide",
    readTime: "5 min read",
    description: "Blog post excerpt 1.",
    authors: JSON.stringify([{ name: "Author name", role: "Author role", avatar: "" }]),
    body: "Blog post body 1.\n\n```python\nfrom nnsight import LanguageModel\n```",
    sourceUrl: "",
    draft: 0,
  },
  {
    id: "preview_2",
    title: "Blog post title 2",
    subtitle: "",
    slug: "blog-post-title-2",
    pubDate: "2026-01-01",
    dateLabel: "January 1, 2026",
    category: "Release",
    readTime: "3 min read",
    description: "Blog post excerpt 2.",
    authors: JSON.stringify([{ name: "Author name", role: "Author role", avatar: "" }]),
    body: "Blog post body 2.",
    sourceUrl: "",
    draft: 0,
  },
];
