/**
 * Shared look for long-read pages: the blog and the docs pages render bodies
 * with these exact classes so the two read as one site.
 */

/** Every body block fills the same single column. */
export const COLUMN = "w-full max-w-none";

/** Typography for rendered Markdown/HTML bodies (Tailwind Typography + tokens). */
export const PROSE = [
  "prose ploy-richtext",
  COLUMN,
  "[--richtext-scroll-offset:6.5rem]",
  "[&_:not(pre)>code]:[overflow-wrap:anywhere]",
  "prose-p:text-[1.0625rem] prose-p:leading-[1.75] prose-p:text-ploy-text-primary/[0.86]",
  "prose-li:text-[1.0625rem] prose-li:leading-[1.7] prose-li:text-ploy-text-primary/[0.86] prose-li:marker:text-ploy-text-secondary",
  "prose-ul:pl-5 prose-ol:pl-5",
  "prose-headings:font-heading prose-headings:font-semibold prose-headings:text-ploy-text-primary prose-headings:text-balance",
  "prose-h2:mt-20 prose-h2:mb-5 prose-h2:text-[1.75rem] prose-h2:leading-[1.2] prose-h2:tracking-[-0.02em] md:prose-h2:text-[2rem]",
  "prose-h3:mt-12 prose-h3:mb-3 prose-h3:text-[1.1875rem] prose-h3:leading-[1.35] prose-h3:tracking-[-0.01em] md:prose-h3:text-[1.25rem]",
  "prose-h4:mt-10 prose-h4:text-[1.0625rem]",
  "prose-strong:text-ploy-text-primary prose-strong:font-semibold",
  "prose-a:font-medium prose-a:text-ploy-accent-primary prose-a:underline prose-a:decoration-ploy-accent-primary/30 prose-a:underline-offset-4 hover:prose-a:decoration-ploy-accent-primary",
  "prose-code:rounded-[5px] prose-code:bg-ploy-text-primary/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.86em] prose-code:font-medium prose-code:text-ploy-text-primary prose-code:before:content-none prose-code:after:content-none",
  "prose-hr:my-14 prose-hr:border-ploy-border-primary",
  "prose-blockquote:border-l-0 prose-blockquote:pl-0 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-ploy-text-primary/[0.86]",
  "[&_.blog-table]:my-8 [&_.blog-table]:overflow-x-auto [&_.blog-table>table]:my-0 [&_.blog-table>table]:w-full [&_.blog-table>table]:text-[0.9375rem]",
  "prose-thead:border-ploy-text-primary/15 prose-tr:border-ploy-text-primary/[0.08] prose-th:pl-0 prose-th:pr-4 prose-td:pl-0 prose-td:pr-4 prose-th:text-left prose-th:text-ploy-text-primary prose-th:font-semibold prose-td:align-top",
  "prose-img:rounded-[6px]",
].join(" ");

/** The same text styles as PROSE, for pages built from components instead of HTML. */
export const BLOG_P = "font-body text-[1.0625rem] leading-[1.75] text-ploy-text-primary/[0.86]";
export const BLOG_H2 =
  "mt-20 mb-5 scroll-mt-24 font-heading text-[1.75rem] leading-[1.2] font-semibold tracking-[-0.02em] text-balance text-ploy-text-primary md:text-[2rem]";
export const BLOG_H3 =
  "mt-12 mb-3 scroll-mt-24 font-heading text-[1.1875rem] leading-[1.35] font-semibold tracking-[-0.01em] text-balance text-ploy-text-primary md:text-[1.25rem]";
export const BLOG_CODE =
  "rounded-[5px] bg-ploy-text-primary/[0.08] px-1.5 py-0.5 font-mono text-[0.86em] font-medium text-ploy-text-primary [overflow-wrap:anywhere]";
export const BLOG_LINK =
  "font-medium text-ploy-accent-primary underline decoration-ploy-accent-primary/30 underline-offset-4 hover:decoration-ploy-accent-primary";

/** Frosted surface shared by notes, details and figures. */
export const GLASS_SURFACE =
  "border border-white shadow-[0_0_0_1px_rgb(20_20_28/0.07),inset_0_1px_0_rgb(255_255_255/0.9),0_24px_48px_-34px_rgb(20_20_28/0.4)] dark:border-ploy-border-primary dark:shadow-none";
export const GLASS_BG = "background: var(--glass-surface);";

/** Dark editor frame around code blocks. */
export const CODE_FRAME =
  "not-prose my-8 overflow-hidden rounded-[6px] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_0_0_1px_rgb(20_16_60/0.14),0_20px_40px_-30px_rgb(30_20_90/0.7)]";
export const CODE_BG = "background: linear-gradient(180deg, #191a2e, #11111d);";

/** Hairline card border that lifts on hover. */
export const CARD_SHADOW =
  "shadow-[0_0_0_1px_rgb(14_14_20/0.08)] transition-shadow duration-300 hover:shadow-[0_0_0_1px_rgb(14_14_20/0.08),0_24px_48px_-24px_rgb(14_14_20/0.25)]";

/** Wrap tables so wide ones scroll inside the column. */
export const wrapTables = (html: string) =>
  html.replace(/<table/g, '<div class="blog-table"><table').replace(/<\/table>/g, "</table></div>");
