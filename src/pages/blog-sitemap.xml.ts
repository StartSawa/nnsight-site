import type { APIRoute } from "astro";
import { blogDb, listPosts, setBlogCacheHeaders } from "../lib/blog-db";
import { CATEGORIES, categoryPath } from "../components/sections/blog/types";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export const GET: APIRoute = async ({ site, url }) => {
  const { posts, transient } = await listPosts();
  if (transient) return blogDb.unavailable();
  const origin = (site ?? url).origin;
  const categories = [...new Set([...CATEGORIES, ...posts.map((p) => p.category)])].filter(
    (c) => posts.some((p) => p.category === c),
  );
  const years = [...new Set(posts.map((p) => p.pubDate.slice(0, 4)))];
  const entries = [
    `<url><loc>${origin}/blog</loc></url>`,
    ...posts.map(
      (p) => `<url><loc>${esc(origin + p.path)}</loc><lastmod>${p.pubDate}</lastmod></url>`,
    ),
    ...categories.map((c) => `<url><loc>${esc(origin + categoryPath(c))}</loc></url>`),
    ...years.map((y) => `<url><loc>${origin}/blog/archive/${y}</loc></url>`),
  ];
  const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.join("\n")}\n</urlset>\n`;
  const headers = new Headers({ "Content-Type": "application/xml; charset=utf-8" });
  setBlogCacheHeaders(headers);
  return new Response(body, { headers });
};
