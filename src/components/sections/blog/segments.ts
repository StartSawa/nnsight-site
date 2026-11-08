// Splits a post's Markdown body into the blocks the article template renders
// itself (code, figures, collapsible details) and the Markdown in between,
// which goes through renderRichText. Splitting happens on the Markdown, never
// on rendered HTML.

export type Segment =
  | { type: "md"; md: string }
  | { type: "code"; lang: string; code: string }
  | { type: "figure"; alt: string; src: string }
  | { type: "details"; summary: string; children: Segment[] }
  | { type: "note"; title: string; children: Segment[] }
  | { type: "viz"; name: string };

const FENCE_OPEN = /^(`{3,})([\w+-]*)\s*$/;
const FIGURE = /^!\[((?:[^\]\\]|\\.)*)\]\((\S+?)\)\s*$/;
const DETAILS_OPEN = /^:::(details|note)\s+(.*)$/;
const VIZ = /^::viz\s+([\w-]+)\s*$/;

function unescapeMd(text: string) {
  return text.replace(/\\([\\`*_[\]{}()#+\-.!|])/g, "$1");
}

export function splitSegments(markdown: string): Segment[] {
  const lines = markdown.replace(/\r\n/g, "\n").split("\n");
  const out: Segment[] = [];
  let buf: string[] = [];

  const flush = () => {
    const md = buf.join("\n").trim();
    if (md) out.push({ type: "md", md });
    buf = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    const fence = FENCE_OPEN.exec(line);
    if (fence) {
      const close = fence[1];
      const code: string[] = [];
      let j = i + 1;
      while (j < lines.length && lines[j].trim() !== close) code.push(lines[j++]);
      flush();
      out.push({ type: "code", lang: fence[2] || "text", code: code.join("\n") });
      i = j;
      continue;
    }

    const details = DETAILS_OPEN.exec(line);
    if (details) {
      const inner: string[] = [];
      let depth = 1;
      let j = i + 1;
      for (; j < lines.length; j++) {
        if (DETAILS_OPEN.test(lines[j])) depth++;
        else if (lines[j].trim() === ":::" && --depth === 0) break;
        inner.push(lines[j]);
      }
      flush();
      const children = splitSegments(inner.join("\n"));
      out.push(
        details[1] === "note"
          ? { type: "note", title: details[2].trim(), children }
          : { type: "details", summary: details[2].trim(), children },
      );
      i = j;
      continue;
    }

    const viz = VIZ.exec(line.trim());
    if (viz) {
      flush();
      out.push({ type: "viz", name: viz[1] });
      continue;
    }

    const figure = FIGURE.exec(line.trim());
    const blankBefore = i === 0 || !lines[i - 1].trim();
    const blankAfter = i === lines.length - 1 || !lines[i + 1].trim();
    if (figure && blankBefore && blankAfter) {
      flush();
      out.push({ type: "figure", alt: unescapeMd(figure[1]), src: figure[2] });
      continue;
    }

    buf.push(line);
  }
  flush();
  return out;
}

/** A figure caption only when the alt text reads as words, not a file id. */
export function figureCaption(alt: string) {
  return /\s/.test(alt.trim()) ? alt.trim() : "";
}
