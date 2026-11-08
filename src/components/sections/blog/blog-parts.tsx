import { CodeLines } from "@/components/sections/home/code-panel";
import { CARD_SHADOW } from "./blog-styles";
import { cn } from "@/lib/utils";
import { categoryPath, type BlogAuthor, type BlogPost } from "./types";

// Posts carry no cover art, so each post's own first code sample is its cover.
/**
 * @ployComponent
 * @ployComponentId blog-post-cover
 * @ployComponentType section
 * @ployComponentTags blog, cover, code
 * @ployComponentDescription Post cover: the post's first figure on a white panel when it has one, otherwise a dark editor panel with the first lines of its first code sample; sm, md and lg sizes.
 * @ployComponentStatus stable
 */
export function PostCover({
  post,
  className,
  size = "md",
}: {
  post: BlogPost;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  if (post.coverImage) {
    return (
      <div
        className={cn(
          "relative flex items-center justify-center overflow-hidden rounded-[6px] bg-white shadow-[inset_0_0_0_1px_rgb(14_14_20/0.08)]",
          size === "sm" ? "p-2" : size === "md" ? "p-4" : "p-5 md:p-8",
          className,
        )}
      >
        <img
          src={post.coverImage}
          alt=""
          loading={size === "lg" ? "eager" : "lazy"}
          decoding="async"
          className="h-full w-full object-contain"
        />
      </div>
    );
  }
  const lines = post.cover
    ? post.cover.split("\n").slice(0, size === "sm" ? 4 : size === "md" ? 7 : 10).join("\n")
    : "";
  return (
    <div
      aria-hidden="true"
      className={cn(
        "relative overflow-hidden rounded-[6px] bg-ploy-background-inverse",
        className,
      )}
    >
      <div
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,rgb(161_52_235/0),rgb(161_52_235/0.7),rgb(67_133_190/0.7),rgb(67_133_190/0))]",
        )}
      />
      {lines ? (
        <CodeLines
          code={lines}
          className={cn(
            "overflow-hidden",
            size === "sm" && "pt-3 text-[0.5625rem] md:text-[0.5625rem] [&_span.w-10]:w-6 [&_span.w-10]:pr-2",
            size === "md" && "pt-5 text-[0.6875rem] md:text-[0.75rem]",
            size === "lg" && "pt-7 text-[0.75rem] md:text-[0.875rem]",
          )}
        />
      ) : null}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-[linear-gradient(180deg,rgb(18_18_24/0),rgb(18_18_24/1))]" />
    </div>
  );
}

export function PostMeta({
  post,
  className,
  linkCategory = false,
}: {
  post: BlogPost;
  className?: string;
  linkCategory?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-ploy-text-secondary",
        className,
      )}
    >
      {linkCategory ? (
        <a
          href={categoryPath(post.category)}
          className="relative z-10 font-medium text-ploy-accent-primary hover:underline hover:underline-offset-4"
        >
          {post.category}
        </a>
      ) : (
        <span className="font-medium text-ploy-accent-primary">{post.category}</span>
      )}
      <span aria-hidden="true">·</span>
      <span>{post.readTime}</span>
    </div>
  );
}

export function AuthorAvatar({ author, size = 36 }: { author: BlogAuthor; size?: number }) {
  return author.avatar ? (
    <img
      src={author.avatar}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      className="shrink-0 rounded-full bg-ploy-neutral-primary-s2 object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      aria-hidden="true"
      className="shrink-0 rounded-full bg-ploy-neutral-primary-s2"
      style={{ width: size, height: size }}
    />
  );
}

/** Stacked author photos, names and the post date. */
export function AuthorLine({ post, className }: { post: BlogPost; className?: string }) {
  const names = post.authors.map((a) => a.name).join(", ");
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div className="flex -space-x-2">
        {post.authors.map((a) => (
          <span key={a.name} className="rounded-full ring-2 ring-ploy-background-primary">
            <AuthorAvatar author={a} />
          </span>
        ))}
      </div>
      <div className="text-[0.875rem] leading-tight">
        <p className="font-medium text-ploy-text-primary">{names}</p>
        <p className="mt-0.5 text-ploy-text-secondary">
          <time dateTime={post.pubDate}>{post.dateLabel}</time>
        </p>
      </div>
    </div>
  );
}

const cardShadow = CARD_SHADOW;

/**
 * @ployComponent
 * @ployComponentId blog-featured-post
 * @ployComponentType section
 * @ployComponentTags blog, featured, card
 * @ployComponentDescription Lead story: wide code cover beside category and read time, large title, excerpt, authors with date and a Continue reading link.
 * @ployComponentStatus stable
 */
export function FeaturedPost({ post }: { post: BlogPost }) {
  return (
    <article className="group relative grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)] lg:gap-14">
      <PostCover post={post} size="lg" className="aspect-[16/10] w-full" />
      <div>
        <PostMeta post={post} linkCategory />
        <h2 className="mt-5 text-balance font-heading text-[2rem] font-semibold leading-[1.08] tracking-[-0.03em] text-ploy-text-primary md:text-[2.75rem] md:tracking-[-0.035em]">
          <a href={post.path} className="after:absolute after:inset-0 group-hover:text-ploy-accent-primary transition-colors">
            {post.title}
          </a>
        </h2>
        <p className="mt-5 line-clamp-5 text-[1.0625rem] leading-[1.65] text-ploy-text-secondary">
          {post.description}
        </p>
        <AuthorLine post={post} className="mt-8" />
        <span className="mt-8 inline-block text-[0.9375rem] font-medium text-ploy-text-primary underline decoration-ploy-border-primary underline-offset-[6px] transition-colors group-hover:decoration-ploy-text-primary">
          Continue reading
        </span>
      </div>
    </article>
  );
}

/**
 * @ployComponent
 * @ployComponentId blog-post-card
 * @ployComponentType section
 * @ployComponentTags blog, card, posts
 * @ployComponentDescription Post card with code cover, category and read time, title, clamped excerpt and author line.
 * @ployComponentStatus stable
 */
export function PostCard({ post, headingLevel = "h3" }: { post: BlogPost; headingLevel?: "h2" | "h3" }) {
  const H = headingLevel;
  return (
    <article className={cn("group relative flex h-full flex-col overflow-hidden rounded-[6px] bg-ploy-background-primary", cardShadow)}>
      <PostCover post={post} size="md" className="aspect-[16/9] w-full rounded-none shadow-[inset_0_-1px_0_rgb(14_14_20/0.08)]" />
      <div className="flex flex-1 flex-col p-6 md:p-7">
        <PostMeta post={post} />
        <H className="mt-4 text-balance text-[1.375rem] font-semibold leading-[1.2] tracking-[-0.02em] text-ploy-text-primary transition-colors group-hover:text-ploy-accent-primary">
          <a href={post.path} className="after:absolute after:inset-0">
            {post.title}
          </a>
        </H>
        <p className="mt-3 line-clamp-3 text-[0.9375rem] leading-[1.6] text-ploy-text-secondary">
          {post.description}
        </p>
        <AuthorLine post={post} className="mt-auto pt-7" />
      </div>
    </article>
  );
}

/**
 * @ployComponent
 * @ployComponentId blog-post-row
 * @ployComponentType section
 * @ployComponentTags blog, list, archive
 * @ployComponentDescription Compact archive row: small code thumbnail, title, two-line excerpt, date with category and read time on the right.
 * @ployComponentStatus stable
 */
export function PostRow({ post }: { post: BlogPost }) {
  return (
    <article className="group relative grid gap-4 border-t border-ploy-border-primary py-7 sm:grid-cols-[168px_minmax(0,1fr)] sm:gap-7 md:grid-cols-[168px_minmax(0,1fr)_auto] md:items-center">
      <PostCover post={post} size="sm" className="hidden aspect-[16/10] w-full rounded-[6px] sm:block" />
      <div className="min-w-0">
        <PostMeta post={post} className="md:hidden" />
        <h3 className="mt-2 text-[1.1875rem] font-semibold leading-[1.3] tracking-[-0.015em] text-ploy-text-primary transition-colors group-hover:text-ploy-accent-primary md:mt-0 md:text-[1.25rem]">
          <a href={post.path} className="after:absolute after:inset-0">
            {post.title}
          </a>
        </h3>
        <p className="mt-2 line-clamp-2 text-[0.9375rem] leading-[1.6] text-ploy-text-secondary">
          {post.description}
        </p>
        <p className="mt-3 text-[0.8125rem] text-ploy-text-secondary md:hidden">
          <time dateTime={post.pubDate}>{post.dateLabel}</time>
        </p>
      </div>
      <div className="hidden text-right text-[0.8125rem] leading-[1.6] text-ploy-text-secondary md:block">
        <p>
          <time dateTime={post.pubDate}>{post.dateLabel}</time>
        </p>
        <p>
          <span className="text-ploy-accent-primary">{post.category}</span> · {post.readTime}
        </p>
      </div>
    </article>
  );
}

/**
 * @ployComponent
 * @ployComponentId blog-category-nav
 * @ployComponentType section
 * @ployComponentTags blog, categories, filter, navigation
 * @ployComponentDescription Pill navigation for the blog root and each category; the active pill is dark.
 * @ployComponentStatus stable
 */
export function CategoryNav({
  categories,
  active,
}: {
  categories: string[];
  active: string | null;
}) {
  const items = [{ label: "Blog", href: "/blog", key: null as string | null }].concat(
    categories.map((c) => ({ label: c, href: categoryPath(c), key: c })),
  );
  return (
    <nav aria-label="Categories" className="-mx-1 overflow-x-auto px-1">
      <ul className="flex min-w-max gap-2">
        {items.map((item) => {
          const isActive = item.key === active;
          return (
            <li key={item.href}>
              <a
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex h-9 items-center rounded-[4px] px-4 text-[0.875rem] font-medium transition-colors",
                  isActive
                    ? "bg-ploy-background-inverse text-white"
                    : "text-ploy-text-secondary shadow-[inset_0_0_0_1px_var(--ploy-border-primary)] hover:bg-ploy-neutral-primary-s1 hover:text-ploy-text-primary",
                )}
              >
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
