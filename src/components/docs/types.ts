/** Docs body blocks, the same kinds the blog renders (see DocsSegments.astro). */
export type Seg =
  | { type: "html"; html: string }
  | { type: "code"; lang: string; code: string }
  | { type: "output"; text: string }
  | { type: "figure"; src: string; alt: string }
  | { type: "plotly"; src: string; height: number }
  | { type: "note"; title: string; children: Seg[] }
  | { type: "details"; summary: string; children: Seg[] };

export type TocItem = { id: string; label: string; depth: number };
