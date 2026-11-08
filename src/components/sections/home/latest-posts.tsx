import { Container } from "@/components/design-system/ui/container";
import { Heading } from "@/components/design-system/ui/heading";

const ASSET = "/media/";

const POSTS = [
  {
    title: "NNsight 0.8",
    href: "/blog/2026/09/09/nnsight-08/",
    author: "Jaden Fiotto-Kaufman",
    photo: ASSET + "37c3351e-30425567.webp",
    date: "September 9, 2026",
    category: "Release",
    read: "17 min read",
    excerpt:
      "We spent the summer rebuilding NNsight from the inside, and it's finally ready. v0.8 is the biggest release the library has had: the execution engine is rewritten from scratch, and a lot of what was hard or impossible in v0.7 falls out of that.",
  },
  {
    title: "NNsight × vLLM: Interpretability at Production Scale",
    href: "/blog/2026/07/13/nnsight--vllm-interpretability-at-production-scale/",
    author: "Zikai Wang",
    photo: ASSET + "d5a9f9b3-55374672.webp",
    date: "July 13, 2026",
    category: "Guide",
    read: "16 min read",
    excerpt:
      "There is growing demand for deploying interpretability at production scale: harvesting activations from frontier models for SAE training, steering and probing behavior during live serving, and study internals of models with hundreds of billions of parameters.",
  },
  {
    title: "How to make your NDIF experiment 130x faster",
    href: "/blog/2026/04/30/how-to-make-your-ndif-experiment-130x-faster/",
    author: "Adam Belfki",
    photo: ASSET + "b37e1120-57205266.webp",
    date: "April 30, 2026",
    category: "Guide",
    read: "10 min read",
    excerpt:
      "A user had reached out to me recently asking how they could make their nnsight code faster with NDIF to meet a project deadline. After looking at their code, I introduced a number of improvements that leverage nnsight features and remote execution principles. The result was a 130x improvement speedup.",
  },
];

/**
 * @ployComponent
 * @ployComponentId home-latest-posts
 * @ployComponentType section
 * @ployComponentTags blog, posts, authors
 * @ployComponentDescription Three latest blog posts as cards: category and read time, title, clamped excerpt, author photo, name and date; Blog link.
 * @ployComponentStatus stable
 */
export function HomeLatestPosts() {
  return (
    <section className="relative isolate overflow-hidden py-14 md:py-24">
      <Container>
        <div data-rise className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <Heading level={2} className="text-ploy-text-primary">
            From the blog
          </Heading>
          <a
            href="/blog/"
            className="text-[0.9375rem] font-medium text-ploy-text-secondary underline decoration-ploy-border-primary underline-offset-[6px] transition-colors hover:text-ploy-text-primary hover:decoration-ploy-text-primary"
          >
            All posts
          </a>
        </div>

        <div data-rise-group className="mt-12 grid gap-5 lg:grid-cols-3">
          {POSTS.map((p) => (
            <a
              key={p.href}
              href={p.href}
              className="glass group relative flex h-full flex-col overflow-hidden rounded-[6px] p-6 md:p-8"
            >
              <div className="flex items-center gap-2 text-[0.8125rem] text-ploy-text-secondary">
                <span className="font-medium text-ploy-accent-primary">
                  {p.category}
                </span>
                <span aria-hidden="true">·</span>
                <span>{p.read}</span>
              </div>
              <h3 className="mt-6 text-[1.25rem] font-semibold leading-[1.18] tracking-[-0.025em] text-ploy-text-primary transition-colors group-hover:text-ploy-accent-primary">
                {p.title}
              </h3>
              <p className="mt-4 line-clamp-4 text-[0.9375rem] leading-[1.6] text-ploy-text-secondary">
                {p.excerpt}
              </p>
              <div className="mt-auto flex items-center gap-3 pt-8">
                <img
                  src={p.photo}
                  alt=""
                  width={36}
                  height={36}
                  loading="lazy"
                  decoding="async"
                  className="size-9 rounded-full object-cover"
                />
                <div className="text-[0.875rem] leading-tight">
                  <p className="font-medium text-ploy-text-primary">{p.author}</p>
                  <p className="mt-0.5 text-ploy-text-secondary">{p.date}</p>
                </div>
              </div>
            </a>
          ))}
        </div>
      </Container>
    </section>
  );
}
