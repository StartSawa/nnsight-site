/**
 * Docs body typography: the blog's PROSE (blog-styles.ts) with tighter
 * heading spacing, since docs pages run many short sections. Kept as one
 * literal list so Tailwind sees every class.
 */
export const DOCS_PROSE = [
  "prose ploy-richtext w-full max-w-none",
  "[--richtext-scroll-offset:6.5rem]",
  "[&_:not(pre)>code]:[overflow-wrap:anywhere]",
  "prose-p:text-[1.0625rem] prose-p:leading-[1.75] prose-p:text-ploy-text-primary/[0.86]",
  "prose-li:text-[1.0625rem] prose-li:leading-[1.7] prose-li:text-ploy-text-primary/[0.86] prose-li:marker:text-ploy-text-secondary",
  "prose-ul:pl-5 prose-ol:pl-5",
  "prose-headings:font-heading prose-headings:font-semibold prose-headings:text-ploy-text-primary prose-headings:text-balance prose-headings:scroll-mt-28",
  "prose-h2:mt-14 prose-h2:mb-4 prose-h2:text-[1.5rem] prose-h2:leading-[1.25] prose-h2:tracking-[-0.02em] md:prose-h2:text-[1.75rem]",
  "prose-h3:mt-10 prose-h3:mb-3 prose-h3:text-[1.1875rem] prose-h3:leading-[1.35] prose-h3:tracking-[-0.01em] md:prose-h3:text-[1.25rem]",
  "prose-h4:mt-8 prose-h4:text-[1.0625rem]",
  "prose-strong:text-ploy-text-primary prose-strong:font-semibold",
  "prose-a:[overflow-wrap:anywhere] prose-a:font-medium prose-a:text-ploy-accent-primary prose-a:underline prose-a:decoration-ploy-accent-primary/30 prose-a:underline-offset-4 hover:prose-a:decoration-ploy-accent-primary",
  "prose-code:rounded-[5px] prose-code:bg-ploy-text-primary/[0.08] prose-code:px-1.5 prose-code:py-0.5 prose-code:font-mono prose-code:text-[0.86em] prose-code:font-medium prose-code:text-ploy-text-primary prose-code:before:content-none prose-code:after:content-none",
  "prose-hr:my-12 prose-hr:border-ploy-border-primary",
  "prose-blockquote:border-l-2 prose-blockquote:border-ploy-border-primary prose-blockquote:pl-4 prose-blockquote:font-normal prose-blockquote:not-italic prose-blockquote:text-ploy-text-primary/[0.86]",
  "[&_.blog-table]:my-6 [&_.blog-table]:overflow-x-auto [&_.blog-table>table]:my-0 [&_.blog-table>table]:w-full [&_.blog-table>table]:text-[0.9375rem]",
  "prose-thead:border-ploy-text-primary/15 prose-tr:border-ploy-text-primary/[0.08] prose-th:pl-0 prose-th:pr-4 prose-th:text-left prose-th:text-ploy-text-primary prose-th:font-semibold prose-td:pl-0 prose-td:pr-4 prose-td:align-top",
  "prose-img:rounded-[6px] prose-img:inline-block",
].join(" ");
