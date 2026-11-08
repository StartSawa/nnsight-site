interface SiteConfig {
  name: string;
  description: string;
  // URL(s) of an existing sitemap to mirror at /sitemap.xml with hosts
  // rewritten to this site's domain. Empty to disable.
  sourceSitemapUrl: string | string[];
}

export const SITE_CONFIG: SiteConfig = {
  name: "nnsight",
  description:
    "Documentation for the nnsight Python library",
  sourceSitemapUrl: "",
};
