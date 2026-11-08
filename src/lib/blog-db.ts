// Server-only blog data. Posts live in src/content/blog-posts.json, one object
// per post. To add or edit a post, edit that file and redeploy. Set
// "draft": 1 to hide a post on the built site.
import rows from "../content/blog-posts.json";
import {
  BLOG_PLOYDB_ID,
  POSTS_FIELDS,
  POSTS_TABLE,
  parsePost,
  sortPosts,
  type BlogPost,
} from "../components/sections/blog/types";

export { BLOG_PLOYDB_ID, POSTS_FIELDS, POSTS_TABLE };

type Row = Record<string, unknown> & { draft?: number | null };

function visibleRows(): Row[] {
  const all = rows as Row[];
  return import.meta.env.PROD ? all.filter((r) => Number(r.draft ?? 0) !== 1) : all;
}

export function setBlogCacheHeaders(headers: Headers) {
  headers.set("Cache-Control", "public, max-age=0");
  headers.set("Cloudflare-CDN-Cache-Control", "max-age=60, stale-while-revalidate=86400");
}

/** Every published post, newest first. */
export async function listPosts(): Promise<{ posts: BlogPost[]; transient: boolean }> {
  return { posts: sortPosts(visibleRows().map(parsePost)), transient: false };
}

/** One published post by slug. */
export async function getPost(slug: string): Promise<{ post: BlogPost | null; transient: boolean }> {
  const row = visibleRows().find((r) => r.slug === slug);
  return { post: row ? parsePost(row) : null, transient: false };
}

/** Kept for the page files' imports; posts are local, so this never runs. */
export const blogDb = {
  unavailable: () => new Response("Blog temporarily unavailable", { status: 503 }),
};
