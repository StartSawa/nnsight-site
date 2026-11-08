import type { APIRoute } from "astro";

import { listPosts } from "@/lib/blog-db";
import { DOC_PAGES, DOCS_NAV, type SectionKey } from "@/lib/docs-links";
import { postPath } from "@/components/sections/blog/types";

export const prerender = true;

type Entry = { title: string; section: string; href: string };

/** Page titles for the header search: every page this site hosts. */
export const GET: APIRoute = async () => {
  const entries: Entry[] = [
    { title: "Home", section: "nnsight", href: "/" },
    { title: "Blog", section: "nnsight", href: "/blog" },
    { title: "Status", section: "nnsight", href: "/status" },
  ];
  for (const p of DOC_PAGES) {
    entries.push({ title: p.title, section: DOCS_NAV[p.section as SectionKey]?.label ?? "nnsight", href: p.path });
  }
  const { posts } = await listPosts();
  for (const p of posts) {
    entries.push({ title: p.title, section: "Blog", href: postPath(p.pubDate, p.slug) });
  }
  const seen = new Set<string>();
  const unique = entries.filter((e) => !seen.has(e.href) && seen.add(e.href));
  return new Response(JSON.stringify(unique), { headers: { "Content-Type": "application/json" } });
};
