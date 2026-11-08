import docsNav from "@/content/docs-nav.json";
import docsIndex from "@/content/docs/index.json";

/**
 * The docs pages this site serves: every nnsight.net page, copied into
 * src/content/docs by scripts/import-docs.ts. Links never leave the site.
 */

/** `own` is true when a folder has its own overview page. */
export type NavLink = { label: string; path: string; own?: boolean; children?: NavLink[] };
export type SectionKey = "getting-started" | "documentation" | "features" | "vllm" | "tutorials";
export type DocMeta = { path: string; section: string; title: string; description: string };

export const DOCS_NAV = docsNav as Record<SectionKey, NavLink>;
export const SECTION_KEYS = Object.keys(DOCS_NAV) as SectionKey[];
export const DOC_PAGES = (docsIndex as { pages: DocMeta[] }).pages;

const HOSTED = new Set<string>(["/", "/status", ...DOC_PAGES.map((p) => p.path)]);

export function normPath(p: string) {
  return ("/" + p.replace(/^\/+/, "")).replace(/\/+$/, "") || "/";
}

/** True when this site serves the page. */
export function isHosted(path: string) {
  const p = normPath(path);
  return HOSTED.has(p) || p.startsWith("/blog");
}

/** The section page a docs path belongs to, e.g. "/features". */
export function sectionPath(path: string) {
  const first = normPath(path).split("/")[1];
  return first ? `/${first}` : "/";
}

/** The page itself when hosted, otherwise its section page on this site. */
export function docUrl(path: string, hash = "") {
  const p = normPath(path);
  return isHosted(p) ? p + hash : sectionPath(p);
}

export function isExternal(href: string) {
  return /^https?:\/\//.test(href);
}

/** Every page path under a nav item, depth first. */
export function flattenNav(links: NavLink[] = []): NavLink[] {
  return links.flatMap((l) => [l, ...flattenNav(l.children)]);
}
