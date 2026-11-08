import type { ReactNode } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";

const KEYWORDS = new Set([
  "from",
  "import",
  "with",
  "as",
  "def",
  "return",
  "for",
  "in",
  "if",
  "else",
  "True",
  "False",
  "None",
]);
const BUILTINS = new Set(["print", "len", "range"]);

const TOKEN =
  /(#.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][A-Za-z0-9_]*)|(\s+)|(.)/g;

/** Tiny Python highlighter for marketing code samples. */
export function highlightPython(line: string): ReactNode[] {
  const out: ReactNode[] = [];
  let m: RegExpExecArray | null;
  let i = 0;
  TOKEN.lastIndex = 0;
  while ((m = TOKEN.exec(line))) {
    const [text, comment, str, num, word] = m;
    const key = i++;
    if (comment) {
      out.push(
        <span key={key} className="text-[#9a9aae]">
          {text}
        </span>,
      );
    } else if (str) {
      out.push(
        <span key={key} className="text-[#f2c48d]">
          {text}
        </span>,
      );
    } else if (num) {
      out.push(
        <span key={key} className="text-[#f39bb6]">
          {text}
        </span>,
      );
    } else if (word) {
      const next = line.slice(m.index + text.length);
      if (KEYWORDS.has(word)) {
        out.push(
          <span key={key} className="text-[#c99bff]">
            {text}
          </span>,
        );
      } else if (BUILTINS.has(word) || next.startsWith("(")) {
        out.push(
          <span key={key} className="text-[#86c1f0]">
            {text}
          </span>,
        );
      } else {
        out.push(text);
      }
    } else {
      out.push(text);
    }
  }
  return out;
}

/**
 * Works without React on the page: the small script in Layout.astro listens for
 * clicks on [data-copy] and sets data-copied for a moment, which swaps the icon.
 */
export function CopyButton({
  value,
  className,
  tone = "dark",
}: {
  value: string;
  className?: string;
  tone?: "dark" | "light";
}) {
  return (
    <button
      type="button"
      aria-label={`Copy ${value}`}
      data-copy={value}
      className={cn(
        "group inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-[10px] transition-colors duration-200 md:size-9",
        tone === "dark"
          ? "text-white/55 hover:bg-white/10 hover:text-white"
          : "text-ploy-text-secondary hover:bg-ploy-neutral-primary-s3 hover:text-ploy-text-primary",
        className,
      )}
    >
      <Copy className="size-4 group-data-[copied]:hidden" />
      <Check className="hidden size-4 group-data-[copied]:block" />
    </button>
  );
}

type CodeLinesProps = {
  code: string;
  /** 1-based line numbers to mark with a soft brand wash. */
  highlight?: Record<number, "violet" | "blue">;
  className?: string;
};

/**
 * @ployComponent
 * @ployComponentId code-lines
 * @ployComponentType component
 * @ployComponentTags code, syntax, editor
 * @ployComponentDescription Dark-editor Python code block with line numbers, light syntax colors and optional violet or blue line washes. Pair with CopyButton.
 * @ployComponentStatus stable
 */
export function CodeLines({ code, highlight = {}, className }: CodeLinesProps) {
  const lines = code.split("\n");
  return (
    <pre
      className={cn(
        "overflow-x-auto font-mono text-[0.8125rem] leading-[1.75] text-[#e8e8f0] md:text-[0.875rem]",
        className,
      )}
    >
      <code className="block min-w-max">
        {lines.map((line, idx) => {
          const n = idx + 1;
          const mark = highlight[n];
          return (
            <span
              key={n}
              className={cn(
                "relative flex",
                mark === "violet" &&
                  "bg-[linear-gradient(90deg,rgb(161_52_235/0.22),rgb(161_52_235/0))]",
                mark === "blue" &&
                  "bg-[linear-gradient(90deg,rgb(67_133_190/0.26),rgb(67_133_190/0))]",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "w-10 shrink-0 select-none pr-4 text-right text-white/50 md:w-12",
                  mark === "violet" && "text-[#c99bff]",
                  mark === "blue" && "text-[#86c1f0]",
                )}
              >
                {n}
              </span>
              <span className="whitespace-pre pr-6">
                {line ? highlightPython(line) : " "}
              </span>
            </span>
          );
        })}
      </code>
    </pre>
  );
}
