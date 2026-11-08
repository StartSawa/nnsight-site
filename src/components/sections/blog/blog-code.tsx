import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { CodeLines } from "@/components/sections/home/code-panel";
import { cn } from "@/lib/utils";

/** Copy button for article code blocks; hydrate with client:visible. */
export function BlogCopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      title="Copy to clipboard"
      aria-label="Copy to clipboard"
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1600);
        });
      }}
      className="inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-[6px] text-white/55 transition-colors duration-200 hover:bg-white/10 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/60"
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}

/** Same editor styling as CodeLines, without Python colors, for prompts and logs. */
function PlainLines({ code, className }: { code: string; className?: string }) {
  const lines = code.split("\n");
  return (
    <pre
      className={cn(
        "overflow-x-auto font-mono text-[0.8125rem] leading-[1.75] text-[#e8e8f0] md:text-[0.875rem]",
        className,
      )}
    >
      <code className="block min-w-max">
        {lines.map((line, idx) => (
          <span key={idx} className="relative flex">
            <span aria-hidden="true" className="w-10 shrink-0 select-none pr-4 text-right text-white/25 md:w-12">
              {idx + 1}
            </span>
            <span className="whitespace-pre pr-6">{line || " "}</span>
          </span>
        ))}
      </code>
    </pre>
  );
}

/**
 * @ployComponent
 * @ployComponentId blog-code-block-lines
 * @ployComponentType section
 * @ployComponentTags blog, code, syntax
 * @ployComponentDescription Article code body: Python and shell samples use the homepage CodeLines editor colors; text samples keep the same editor styling without syntax colors.
 * @ployComponentStatus stable
 */
export function BlogCodeLines({ code, lang }: { code: string; lang: string }) {
  const highlighted = lang === "python" || lang === "py" || lang === "bash" || lang === "sh";
  return highlighted ? (
    <CodeLines code={code} className="py-5 pr-2" />
  ) : (
    <PlainLines code={code} className="py-5 pr-2" />
  );
}
