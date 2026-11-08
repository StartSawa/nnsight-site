import { Container } from "@/components/design-system/ui/container";
import { Heading } from "@/components/design-system/ui/heading";
import { CategoryNav, FeaturedPost, PostCard, PostRow } from "./blog-parts";
import type { BlogPost } from "./types";

type BlogIndexProps = {
  /** Page heading: "Blog", a category name, or an archive year. */
  heading: string;
  posts: BlogPost[];
  categories: string[];
  /** Highlighted category pill; null highlights Blog. */
  activeCategory: string | null;
  /** index: lead + cards + archive rows. category: lead + rows. archive: rows only. */
  mode: "index" | "category" | "archive";
};

function groupByYear(posts: BlogPost[]) {
  const groups: { year: string; posts: BlogPost[] }[] = [];
  for (const p of posts) {
    const year = p.pubDate.slice(0, 4);
    const g = groups.find((x) => x.year === year);
    if (g) g.posts.push(p);
    else groups.push({ year, posts: [p] });
  }
  return groups;
}

/**
 * @ployComponent
 * @ployComponentId blog-index
 * @ployComponentType section
 * @ployComponentTags blog, index, featured, categories, archive
 * @ployComponentDescription Blog front page: heading with category pills, a lead story, a row of three cards, then the rest as archive rows grouped by year. Category and archive modes reuse it.
 * @ployComponentStatus stable
 */
export function BlogIndex({ heading, posts, categories, activeCategory, mode }: BlogIndexProps) {
  const lead = mode === "archive" ? null : posts[0] ?? null;
  const rest = lead ? posts.slice(1) : posts;
  const cards = mode === "index" ? rest.slice(0, 3) : [];
  const rows = mode === "index" ? rest.slice(3) : rest;
  const years = groupByYear(rows);

  return (
    <>
      <section className="pt-14 pb-12 md:pt-20 md:pb-16">
        <Container>
          <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
            <Heading level={1} as="h1" className="text-ploy-text-primary">
              {heading}
            </Heading>
            <CategoryNav categories={categories} active={activeCategory} />
          </div>
        </Container>
      </section>

      {lead ? (
        <section className="pb-16 md:pb-24">
          <Container>
            <FeaturedPost post={lead} />
          </Container>
        </section>
      ) : null}

      {cards.length ? (
        <section className="border-t border-ploy-border-primary py-16 md:py-20">
          <Container>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {cards.map((p) => (
                <PostCard key={p.id} post={p} headingLevel="h2" />
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {years.length ? (
        <section className="pb-16 md:pb-20">
          <Container>
            {years.map((g) => (
              <div key={g.year} className="mt-4 first:mt-0">
                <h2 className="mb-6 font-heading text-[1.5rem] font-semibold tracking-[-0.02em] text-ploy-text-primary md:text-[1.75rem]">
                  {mode === "archive" ? (
                    g.year
                  ) : (
                    <a href={`/blog/archive/${g.year}`} className="hover:text-ploy-accent-primary">
                      {g.year}
                    </a>
                  )}
                </h2>
                <div className="border-b border-ploy-border-primary">
                  {g.posts.map((p) => (
                    <PostRow key={p.id} post={p} />
                  ))}
                </div>
              </div>
            ))}
          </Container>
        </section>
      ) : null}
    </>
  );
}
