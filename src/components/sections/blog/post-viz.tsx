import { useEffect, useRef, useState, type ReactNode } from "react";
import { Lock, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

/*
 * Figures drawn in code for blog posts. A post body places one with a line
 * `::viz <name>`. Every number and label here comes from the post itself.
 */

const V = "#a134eb";
const B = "#4385be";

/* Frosted-glass system shared by every figure. */
const GRAD = "#2b2b33";
const OLD = "rgb(120 122 132 / 0.45)";
/** A glossy fill: a white sheen over the colour, like a glass rod. */
const gloss = (c: string) => `linear-gradient(180deg, rgb(255 255 255 / 0.42), rgb(255 255 255 / 0) 60%), ${c}`;
const GLASS =
  "rounded-[6px] border border-white/90 bg-white/60 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_1px_2px_rgb(20_20_28/0.05),0_12px_28px_-18px_rgb(20_20_28/0.28)] backdrop-blur-xl";
const TRACK = "bg-[rgb(20_20_28/0.06)] shadow-[inset_0_1px_2px_rgb(20_20_28/0.08)]";
const CHIP = "rounded-[7px] bg-[rgb(20_20_28/0.05)] px-2 py-1";
const SYN = { kw: "#8a2fd1", fn: "#2f6ea6", str: "#a0522d" };
const SURFACE_BG =
  "radial-gradient(120% 100% at 0% 0%, rgb(255 255 255 / 0.95), transparent 60%), linear-gradient(160deg, #f4f4f6 0%, #e9e9ed 55%, #eeeef1 100%)";

function useInView<T extends Element>(threshold = 0.35) {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setSeen(true);
      return;
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setSeen(true);
          io.disconnect();
        }
      },
      { threshold },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [threshold]);
  return [ref, seen] as const;
}

/** Steps 0..n once in view, one every `ms`; replay() restarts. */
function useSteps(n: number, ms: number, seen: boolean) {
  const [step, setStep] = useState(0);
  const [run, setRun] = useState(0);
  useEffect(() => {
    if (!seen) return;
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStep(n);
      return;
    }
    setStep(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setStep(i);
      if (i >= n) clearInterval(t);
    }, ms);
    return () => clearInterval(t);
  }, [seen, n, ms, run]);
  return { step, replay: () => setRun((r) => r + 1) };
}

function Figure({
  caption,
  children,
  className,
}: {
  caption: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <figure>
      <div
        className={cn(
          "theme-light overflow-hidden rounded-[6px] border border-white p-4 text-ploy-text-primary shadow-[0_0_0_1px_rgb(20_20_28/0.07),inset_0_1px_0_rgb(255_255_255/0.9),0_24px_48px_-34px_rgb(20_20_28/0.35)] sm:p-5 md:p-7",
          className,
        )}
        style={{ background: SURFACE_BG }}
      >
        {children}
      </div>
      <figcaption className="mx-auto mt-3.5 max-w-[38rem] text-center text-[0.875rem] italic leading-[1.55] text-ploy-text-secondary">
        {caption}
      </figcaption>
    </figure>
  );
}

function Mono({ children, className }: { children: ReactNode; className?: string }) {
  return <code className={cn("font-mono text-[0.84em]", className)}>{children}</code>;
}

function ReplayButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Replay animation"
      className="inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-white/90 bg-white/55 text-ploy-text-secondary shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_4px_12px_-6px_rgb(20_20_28/0.3)] backdrop-blur-xl transition-colors hover:bg-white/90 hover:text-ploy-text-primary"
    >
      <RotateCcw className="size-4" aria-hidden="true" />
    </button>
  );
}

/* ---------------------------------------------------------------- anatomy */

function Anatomy() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const rows: { label: string; href: string; items: ReactNode[] }[] = [
    {
      label: "Models",
      href: "#more-models-one-class-for-every-transformers-model",
      items: [<Mono key="a">TransformersModel</Mono>, <Mono key="b">DiffusionModel</Mono>, <Mono key="c">VLLM</Mono>],
    },
    {
      label: "Engine",
      href: "#a-faster-engine-greenlets-instead-of-threads",
      items: ["greenlets, not threads", <span key="i">one <Mono>Interleaver</Mono></span>],
    },
    {
      label: "Access",
      href: "#deeper-access-reaching-inside-a-forward-pass-with-source",
      items: [<span key="m">every module</span>, <span key="s">every operation via <Mono>.source</Mono></span>],
    },
    {
      label: "Scale",
      href: "#bigger-models-when-one-gpu-is-not-enough",
      items: [<Mono key="q">dtype="nf4"</Mono>, "tensor parallelism"],
    },
    {
      label: "Serving",
      href: "#production-scale-vllm-is-a-first-class-runtime",
      items: [<Mono key="v">VLLM</Mono>, "taps under CUDA graphs", <Mono key="s">nnsight-serve</Mono>],
    },
  ];
  return (
    <Figure caption="The block you write sits on top. Everything under it is new in v0.8.">
      <div ref={ref} className="flex flex-col gap-2.5">
        <div className={cn(GLASS, "overflow-x-auto whitespace-pre px-5 py-4 font-mono text-[0.8125rem] leading-[1.75] text-ploy-text-primary md:text-[0.875rem]")}>
          <span style={{ color: SYN.kw }}>with</span> model.trace(prompt):
          <br />
          {"    "}hidden = model.transformer.h[6].output.<span style={{ color: SYN.fn }}>save</span>()
          <div className="mt-2 whitespace-normal font-sans text-[0.8125rem] italic text-ploy-text-secondary">Your code, unchanged from v0.7</div>
        </div>
        {rows.map((r, i) => (
          <a
            key={r.label}
            href={r.href}
            className={cn(
              GLASS,
              "group grid grid-cols-[5rem_1fr] items-center gap-3 px-4 py-3 transition-[transform,opacity,background-color] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] hover:bg-white/90 md:grid-cols-[6.5rem_1fr] md:px-5",
            )}
            style={{
              opacity: seen ? 1 : 0,
              transform: seen ? "none" : "translateY(12px)",
              transitionDelay: `${150 + i * 110}ms`,
            }}
          >
            <span className="text-[0.875rem] font-semibold text-ploy-text-primary group-hover:text-ploy-accent-primary">{r.label}</span>
            <span className="flex flex-wrap gap-1.5">
              {r.items.map((it, k) => (
                <span key={k} className={cn(CHIP, "text-[0.8125rem] text-ploy-text-primary/85")}>
                  {it}
                </span>
              ))}
            </span>
          </a>
        ))}
      </div>
    </Figure>
  );
}

/* ---------------------------------------------------------- model classes */

function ModelClasses() {
  const tasks = [
    ["text-generation", "openai-community/gpt2"],
    ["fill-mask", "google-bert/bert-base-uncased"],
    ["image-text-to-text", "llava-hf/llava-interleave-qwen-0.5b-hf"],
    ["automatic-speech-recognition", "openai/whisper-tiny"],
  ];
  const [active, setActive] = useState(0);
  return (
    <Figure caption="One class for every task the transformers pipeline can build. Diffusers and vLLM keep their own classes; the old names still work and warn.">
      <div className="grid gap-5 md:grid-cols-[minmax(0,15rem)_1fr] md:items-center">
        <div className="rounded-[6px] p-[1.5px]" style={{ background: `linear-gradient(135deg, ${V}, ${B})` }}>
          <div className="rounded-[12.5px] bg-white/80 px-5 py-5 backdrop-blur-xl">
            <Mono className="text-[0.9375rem] font-semibold">TransformersModel</Mono>
            <p className="mt-1.5 text-[0.8125rem] text-ploy-text-secondary">
              backed by <Mono>transformers.pipeline</Mono>
            </p>
            <div className="mt-4 overflow-x-auto whitespace-pre rounded-[6px] bg-[rgb(20_20_28/0.05)] px-3 py-2.5 font-mono text-[0.75rem] leading-[1.65] text-ploy-text-primary">
              TransformersModel(
              <br />
              {"  "}
              <span style={{ color: SYN.str }}>"{tasks[active][1]}"</span>,
              <br />
              {"  "}task=<span style={{ color: SYN.str }}>"{tasks[active][0]}"</span>)
            </div>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          {tasks.map(([task, repo], i) => (
            <button
              key={task}
              type="button"
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => setActive(i)}
              className={cn(
                "flex min-w-0 flex-col items-start rounded-[6px] border px-4 py-2.5 text-left transition-colors md:flex-row md:items-center md:justify-between md:gap-4",
                active === i
                  ? "border-white/90 bg-white/75 shadow-[inset_0_1px_0_rgb(255_255_255/0.95),0_0_0_1px_rgb(161_52_235/0.35),0_10px_24px_-16px_rgb(20_20_28/0.4)] backdrop-blur-xl"
                  : "border-transparent hover:bg-white/45",
              )}
            >
              <Mono className={cn(active === i ? "text-ploy-accent-primary" : "text-ploy-text-primary")}>{task}</Mono>
              <span className="max-w-full truncate text-[0.8125rem] text-ploy-text-secondary">{repo}</span>
            </button>
          ))}
          <div className="mt-2 grid grid-cols-2 gap-2 text-[0.8125rem]">
            <div className="rounded-[6px] border border-dashed border-ploy-text-primary/20 bg-white/30 px-4 py-2.5">
              <Mono>DiffusionModel</Mono>
              <p className="text-ploy-text-secondary">diffusers pipelines</p>
            </div>
            <div className="rounded-[6px] border border-dashed border-ploy-text-primary/20 bg-white/30 px-4 py-2.5">
              <Mono>VLLM</Mono>
              <p className="text-ploy-text-secondary">vLLM</p>
            </div>
          </div>
          <p className="mt-1 text-[0.8125rem] text-ploy-text-secondary">
            <Mono className="line-through decoration-ploy-text-secondary/50">LanguageModel</Mono>{" "}
            <Mono className="line-through decoration-ploy-text-secondary/50">VisionLanguageModel</Mono> thin subclasses, warn on construction
          </p>
        </div>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------- chunk rows */

function ChunkRows() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const windows = [0, 1, 2, 3];
  const labels = ["label 1", "label 2", "label 3"];
  const ease = "transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]";
  return (
    <Figure caption="One input you passed, several rows inside the trace: overlapping windows for a long document, one entailment pair per label for zero-shot classification.">
      <div ref={ref} className="grid gap-3 md:grid-cols-2">
        <div className={cn(GLASS, "p-4 md:p-5")}>
          <p className="text-[0.875rem] font-semibold">A document longer than the context</p>
          <div className={cn("relative mt-4 h-4 rounded-full", TRACK)} />
          <div className="mt-4 flex flex-col gap-1.5">
            {windows.map((w) => (
              <div key={w} className="flex items-center gap-3">
                <Mono className="w-12 shrink-0 text-ploy-text-secondary">row {w}</Mono>
                <div className="relative h-4 flex-1">
                  <div
                    className={cn("absolute top-0 h-4 rounded-full", ease)}
                    style={{
                      left: `${w * 22}%`,
                      width: "34%",
                      background: gloss(w % 2 ? B : V),
                      opacity: seen ? 1 : 0,
                      transform: seen ? "none" : "translateY(-14px)",
                      transitionDelay: `${w * 140}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className={cn(GLASS, "p-4 md:p-5")}>
          <p className="text-[0.875rem] font-semibold">Zero-shot classification</p>
          <div className="mt-4 flex h-4 items-center">
            <div className={cn("h-4 w-[46%] rounded-full", TRACK)} />
            <span className="ml-2 text-[0.8125rem] text-ploy-text-secondary">one sentence</span>
          </div>
          <div className="mt-4 flex flex-col gap-1.5">
            {labels.map((l, i) => (
              <div key={l} className="flex items-center gap-3">
                <Mono className="w-12 shrink-0 text-ploy-text-secondary">row {i}</Mono>
                <div
                  className={cn("flex h-4 flex-1 items-center gap-1", ease)}
                  style={{ opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(-14px)", transitionDelay: `${i * 140}ms` }}
                >
                  <div className="h-4 w-[52%] rounded-full" style={{ background: gloss(OLD) }} />
                  <div className="h-4 whitespace-nowrap rounded-full px-2 text-[0.6875rem] font-medium leading-4 text-white" style={{ background: gloss(V) }}>
                    {l}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Figure>
  );
}

/* --------------------------------------------------------- engine handoff */

type Seg = { lane: 0 | 1; w: number; label?: string };
const HANDOFF: Seg[] = [
  { lane: 0, w: 2, label: "block" },
  { lane: 1, w: 4, label: "layers 0 to 6" },
  { lane: 0, w: 2, label: "h[6]" },
  { lane: 1, w: 4, label: "layers 7 to 11" },
  { lane: 0, w: 1.5, label: "save" },
];

function EngineHandoff() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const [mode, setMode] = useState<"v07" | "v08">("v07");
  const { step, replay } = useSteps(HANDOFF.length, 520, seen);
  const gap = mode === "v07" ? 1.6 : 0.25;
  // One shared time scale for both modes, so the v0.8 run visibly ends sooner.
  const total = HANDOFF.reduce((s, x) => s + x.w, 0) + 1.6 * (HANDOFF.length - 1);
  let x = 0;
  const placed = HANDOFF.map((s, i) => {
    const p = { ...s, x, i };
    x += s.w + gap;
    return p;
  });
  const lanes = mode === "v07" ? ["Worker thread (your block)", "Main thread (forward pass)"] : ["Greenlet (your block)", "Forward pass"];
  return (
    <Figure
      caption={
        mode === "v07"
          ? "v0.7: every handoff between your block and the forward pass crossed two OS threads, paying a lock and a GIL handoff."
          : "v0.8: only one greenlet runs at a time, and each handoff is an in-process switch that needs neither a lock nor a queue."
      }
    >
      <div ref={ref}>
        <div className="flex items-center justify-between gap-3">
          <div role="tablist" aria-label="Engine version" className={cn(TRACK, "inline-flex rounded-[6px] p-1")}>
            {(["v07", "v08"] as const).map((m) => (
              <button
                key={m}
                role="tab"
                aria-selected={mode === m}
                type="button"
                onClick={() => {
                  setMode(m);
                  replay();
                }}
                className={cn(
                  "whitespace-nowrap rounded-[4px] px-3 py-1.5 text-[0.8125rem] font-medium transition-colors md:px-4",
                  mode === m
                    ? "bg-white text-ploy-text-primary shadow-[inset_0_1px_0_rgb(255_255_255/1),0_4px_12px_-6px_rgb(20_20_28/0.35)]"
                    : "text-ploy-text-secondary hover:text-ploy-text-primary",
                )}
              >
                {m === "v07" ? "v0.7 threads" : "v0.8 greenlets"}
              </button>
            ))}
          </div>
          <ReplayButton onClick={replay} />
        </div>
        <div className={cn(GLASS, "mt-5 flex flex-col gap-3 p-4 md:p-5")}>
          {lanes.map((lane, li) => (
            <div key={lane}>
              <p className="mb-1.5 text-[0.8125rem] text-ploy-text-secondary">{lane}</p>
              <div className={cn("relative h-9 rounded-[6px]", TRACK)}>
                {mode === "v07" &&
                  placed.slice(0, -1).map((p) => (
                    <div
                      key={`g${p.i}`}
                      aria-hidden="true"
                      className="absolute inset-y-1 rounded-[6px] transition-opacity duration-300"
                      style={{
                        left: `${((p.x + p.w) / total) * 100}%`,
                        width: `${(gap / total) * 100}%`,
                        opacity: step > p.i + 1 ? 1 : 0,
                        background: "repeating-linear-gradient(135deg, rgb(194 98 31 / 0.22) 0 3px, transparent 3px 7px)",
                      }}
                    />
                  ))}
                {placed
                  .filter((p) => p.lane === li)
                  .map((p) => (
                    <div
                      key={p.i}
                      className="absolute top-0 flex h-9 items-center overflow-hidden rounded-[6px] px-2 text-[0.75rem] font-medium text-white transition-[opacity,transform] duration-500"
                      style={{
                        left: `${(p.x / total) * 100}%`,
                        width: `${(p.w / total) * 100}%`,
                        background: gloss(li === 0 ? V : B),
                        opacity: step > p.i ? 1 : 0,
                        transform: step > p.i ? "none" : "scaleX(0.6)",
                        transformOrigin: "left",
                      }}
                    >
                      <span className="hidden truncate sm:inline">{p.label}</span>
                    </div>
                  ))}
              </div>
            </div>
          ))}
          <div className="relative h-6">
            {placed.slice(0, -1).map((p) => (
              <div
                key={p.i}
                className="absolute top-0 flex h-6 -translate-x-1/2 items-center justify-center transition-opacity duration-300"
                style={{ left: `${((p.x + p.w + gap / 2) / total) * 100}%`, opacity: step > p.i + 1 ? 1 : 0 }}
              >
                {mode === "v07" ? (
                  <Lock className="size-3.5 text-[#c2621f]" aria-hidden="true" />
                ) : (
                  <span className="block h-3 w-px bg-ploy-text-primary/35" />
                )}
              </div>
            ))}
          </div>
        </div>
        <p className="mt-3 text-[0.8125rem] text-ploy-text-secondary">
          {mode === "v07"
            ? "Shaded gaps are handoffs. Each one takes a lock and passes the GIL between two OS threads. Schematic, not to scale."
            : "Each tick is a greenlet switch inside one process, so the same work ends sooner. Schematic, not to scale."}
        </p>
      </div>
    </Figure>
  );
}

/* ---------------------------------------------------------- overhead bars */

const OVERHEAD: [string, number, number, string][] = [
  ["Opening a trace with nothing in it", 1.12, 0.51, "ms"],
  ["Each activation read", 36.7, 11.8, "µs"],
  ["Each activation edited", 43.9, 17.1, "µs"],
  ["Each extra prompt batched into one pass", 94.3, 15.6, "µs"],
];

function OverheadBars() {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <Figure caption="NNsight's own cost per operation, v0.7 against v0.8. Shorter is better.">
      <div ref={ref} className="flex flex-col gap-3">
        <div className="flex gap-5 px-1 text-[0.8125rem] text-ploy-text-secondary">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: gloss(OLD) }} /> v0.7
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: gloss(GRAD) }} /> v0.8
          </span>
        </div>
        {OVERHEAD.map(([label, a, b, unit], i) => (
          <div key={label} className={cn(GLASS, "px-4 py-3.5 md:px-5")}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-[0.9375rem] font-medium">{label}</p>
              <p className="shrink-0 text-[0.875rem] font-semibold text-ploy-text-primary">{(a / b).toFixed(1)}x less</p>
            </div>
            {[a, b].map((v, k) => (
              <div key={k} className="mt-2 flex items-center gap-3">
                <div className={cn("h-3 flex-1 rounded-full", TRACK)}>
                  <div
                    className="h-3 origin-left rounded-full transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                    style={{
                      width: `${(v / a) * 100}%`,
                      background: gloss(k ? GRAD : OLD),
                      transform: seen ? "scaleX(1)" : "scaleX(0)",
                      transitionDelay: `${i * 120 + k * 200}ms`,
                    }}
                  />
                </div>
                <span className="w-16 shrink-0 text-right text-[0.8125rem] tabular-nums text-ploy-text-secondary">
                  {v} {unit}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <div className="sr-only"><table>
        <thead>
          <tr>
            <th />
            <th>v0.7</th>
            <th>v0.8</th>
          </tr>
        </thead>
        <tbody>
          {OVERHEAD.map(([l, a, b, u]) => (
            <tr key={l}>
              <td>{l}</td>
              <td>
                {a} {u}
              </td>
              <td>
                {b} {u}
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </Figure>
  );
}

/* ---------------------------------------------------------- out of order */

function OutOfOrder() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const { step, replay } = useSteps(14, 140, seen);
  const nodes = [...Array.from({ length: 12 }, (_, i) => `h[${i}]`), "output"];
  const done = step >= 14;
  return (
    <Figure
      caption={
        <>
          Reading <Mono>model.output</Mono> first runs the whole forward pass. By the time the block asks for{" "}
          <Mono>h[8]</Mono>, the model has already gone past it.
        </>
      }
    >
      <div ref={ref}>
        <div className="flex items-center justify-between">
          <p className="text-[0.875rem] font-medium">GPT-2 forward pass</p>
          <ReplayButton onClick={replay} />
        </div>
        <div className={cn(GLASS, "mt-3 grid grid-cols-[repeat(13,minmax(0,1fr))] gap-1 p-3 md:gap-1.5 md:p-4")}>
          {nodes.map((n, i) => {
            const passed = step > i;
            const isH8 = i === 8;
            const isOut = i === 12;
            return (
              <div key={n} className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-8 w-full rounded-[6px] transition-[background] duration-300",
                    !passed && TRACK,
                    done && isH8 && "ring-2 ring-inset ring-[#d24d4d]",
                  )}
                  style={passed ? { background: gloss(isOut ? V : "rgb(67 133 190 / 0.75)") } : undefined}
                />
                <span className={cn("hidden text-[0.6875rem] tabular-nums text-ploy-text-secondary sm:block", (isH8 || isOut) && "font-semibold text-ploy-text-primary")}>
                  {isOut ? "out" : i}
                </span>
              </div>
            );
          })}
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,1fr)] gap-2 font-mono text-[0.75rem] md:text-[0.8125rem]">
          <div className={cn(GLASS, "flex items-center gap-2 rounded-[6px] px-3 py-2")}>
            <span className="size-2 shrink-0 rounded-full" style={{ background: gloss(V) }} />
            <span className="truncate">logits = model.output.logits.save()</span>
          </div>
          <div
            className={cn(
              GLASS,
              "flex items-center gap-2 rounded-[6px] px-3 py-2 transition-colors duration-300",
              done && "bg-[#fbeeee]/80 text-[#a83232]",
            )}
          >
            <span className={cn("size-2 shrink-0 rounded-full", done ? "bg-[#d24d4d]" : "bg-ploy-text-primary/20")} />
            <span className="truncate">hidden = model.transformer.h[8].output.save()</span>
            {done && <span className="ml-auto hidden shrink-0 sm:inline">OutOfOrderError</span>}
          </div>
        </div>
      </div>
    </Figure>
  );
}

/* -------------------------------------------------------- source explorer */

const SOURCE_LINES: [string, string, string][] = [
  ["", "*", "def forward(self, hidden_states: ...) -> torch.FloatTensor:"],
  ["self_c_fc_0", "0", "hidden_states = self.c_fc(hidden_states)"],
  ["hidden_states_0", "+", "..."],
  ["self_act_0", "1", "hidden_states = self.act(hidden_states)"],
  ["hidden_states_1", "+", "..."],
  ["self_c_proj_0", "2", "hidden_states = self.c_proj(hidden_states)"],
  ["hidden_states_2", "+", "..."],
  ["self_dropout_0", "3", "hidden_states = self.dropout(hidden_states)"],
  ["hidden_states_3", "+", "..."],
  ["", "4", "return hidden_states"],
];

function SourceExplorer() {
  const [sel, setSel] = useState("self_act_0");
  return (
    <Figure
      caption={
        <>
          The printout of <Mono>model.transformer.h[0].mlp.source</Mono>. Pick a label to see how you'd reach that operation.
        </>
      }
    >
      <div className={cn(GLASS, "overflow-x-auto p-3 md:p-4")}>
        <div className="min-w-[34rem] font-mono text-[0.75rem] leading-[1.95] md:text-[0.8125rem]">
          {SOURCE_LINES.map(([label, n, code], i) => (
            <div key={i} className={cn("grid grid-cols-[10.5rem_1.5rem_1fr] items-center rounded-[6px] px-2", sel && label === sel && "bg-[rgb(20_20_28/0.06)]")}>
              {label ? (
                <button
                  type="button"
                  onClick={() => setSel(label)}
                  onMouseEnter={() => setSel(label)}
                  className={cn("text-left transition-colors", sel === label ? "font-medium text-[#8a2fd1]" : "text-ploy-text-secondary hover:text-ploy-text-primary")}
                >
                  {label}
                </button>
              ) : (
                <span />
              )}
              <span className="text-ploy-text-secondary/60">{n}</span>
              <span className={cn(code === "..." ? "text-ploy-text-secondary/60" : "text-ploy-text-primary")}>{code}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={cn(GLASS, "mt-3 px-4 py-3 font-mono text-[0.75rem] text-ploy-text-primary md:text-[0.8125rem]")}>
        <span className="break-all">
          model.transformer.h[0].mlp.source.<span className="font-medium text-[#8a2fd1]">{sel}</span>.output
        </span>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------ dtype widths */

function DtypeWidths() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const rows: [string, string, number][] = [
    ['"bfloat16"', "the usual", 16],
    ['"int8"', "", 8],
    ['"fp8"', "compute capability 8.9 or better", 8],
    ['"nf4"', 'also "int4" and "4bit"', 4],
    ['"fp4"', "", 4],
  ];
  return (
    <Figure caption="Bits per weight for each value dtype= accepts. Module paths and activations stay the same at every width.">
      <div ref={ref} className={cn(GLASS, "flex flex-col gap-3 p-4 md:p-5")}>
        {rows.map(([name, note, bits], r) => (
          <div key={name} className="grid grid-cols-[5rem_1fr] items-center gap-3 md:grid-cols-[6rem_1fr_12.5rem]">
            <Mono className={cn(r === 0 ? "text-ploy-text-secondary" : "text-ploy-text-primary")}>{name}</Mono>
            <div className="grid grid-cols-16 gap-[3px]" style={{ gridTemplateColumns: "repeat(16, minmax(0, 1fr))" }}>
              {Array.from({ length: 16 }, (_, i) => (
                <span
                  key={i}
                  className="h-5 rounded-[4px] transition-[opacity,transform] duration-500"
                  style={{
                    background: i < bits ? gloss(r === 0 ? OLD : r < 3 ? B : V) : "rgb(20 20 28 / 0.06)",
                    opacity: seen ? 1 : 0,
                    transform: seen ? "none" : "scaleY(0.4)",
                    transitionDelay: `${r * 90 + i * 18}ms`,
                  }}
                />
              ))}
            </div>
            <p className="col-span-2 -mt-1 text-[0.8125rem] text-ploy-text-secondary md:col-span-1 md:mt-0">
              {bits} bits{note && ` · ${note}`}
            </p>
          </div>
        ))}
      </div>
    </Figure>
  );
}

/* --------------------------------------------------------------- TP gather */

function TpGather() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const { step, replay } = useSteps(3, 900, seen);
  const ranks = [0, 1, 2, 3];
  const colors = [V, "#8a4fd8", "#6a6fcf", B];
  return (
    <Figure
      caption={
        <>
          Each of four ranks computes 2048 of <Mono>gate_proj</Mono>'s 8192 features. NNsight gathers them before your code reads the
          value, then splits it back across the ranks, edits included.
        </>
      }
    >
      <div ref={ref}>
        <div className="flex justify-end">
          <ReplayButton onClick={replay} />
        </div>
        <div className="grid grid-cols-4 gap-2">
          {ranks.map((r) => (
            <div key={r} className={cn(GLASS, "min-w-0 p-2.5 md:p-3")}>
              <p className="text-[0.8125rem] font-medium">rank {r}</p>
              <div className="mt-2 h-3 rounded-full transition-opacity duration-500" style={{ background: gloss(colors[r]), opacity: step === 1 ? 0.25 : 1 }} />
              <Mono className="mt-1.5 block truncate text-[0.6875rem] text-ploy-text-secondary md:text-[0.75rem]">(1, 11, 2048)</Mono>
            </div>
          ))}
        </div>
        <div className="my-4 flex justify-center">
          <span className="text-[0.8125rem] italic text-ploy-text-secondary">{step >= 2 ? "split back across ranks" : "gathered for your code"}</span>
        </div>
        <div className={cn(GLASS, "p-3 md:p-4")}>
          <p className="text-[0.8125rem] font-medium">what your trace sees, on every rank</p>
          <div className={cn("mt-2 flex h-3 gap-0.5 overflow-hidden rounded-full", TRACK)}>
            {ranks.map((r) => (
              <div
                key={r}
                className="h-3 flex-1 transition-[transform,opacity] duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  background: gloss(colors[r]),
                  opacity: step >= 1 ? 1 : 0,
                  transform: step >= 1 ? "none" : "translateY(-24px)",
                  transitionDelay: `${r * 90}ms`,
                }}
              />
            ))}
          </div>
          <Mono className="mt-1.5 block text-[0.75rem] text-ploy-text-secondary">(1, 11, 8192)</Mono>
        </div>
      </div>
    </Figure>
  );
}

/* --------------------------------------------------------------- vLLM slab */

function VllmSlab() {
  const reqs = [
    { name: "your request", n: 5, c: V },
    { name: "request B", n: 7, c: B },
    { name: "request C", n: 4, c: "#7d8da3" },
  ];
  const [hover, setHover] = useState(0);
  const rows = reqs.flatMap((r, i) => Array.from({ length: r.n }, () => i));
  return (
    <Figure
      caption={
        <>
          vLLM packs every in-flight request's tokens into one <Mono>[total_tokens, hidden]</Mono> slab. NNsight narrows your
          block to its own rows, so there's no batch axis.
        </>
      }
    >
      <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_13rem] md:items-stretch">
        <div className={cn(GLASS, "min-w-0 p-4 md:p-5")}>
          <div className="flex flex-wrap gap-2">
            {reqs.map((r, i) => (
              <button
                key={r.name}
                type="button"
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => setHover(i)}
                className={cn(
                  "rounded-[4px] px-3 py-1 text-[0.8125rem] font-medium transition-colors",
                  hover === i ? "text-white shadow-[0_4px_12px_-6px_rgb(20_20_28/0.5)]" : cn(TRACK, "text-ploy-text-secondary hover:text-ploy-text-primary"),
                )}
                style={hover === i ? { background: gloss(r.c) } : undefined}
              >
                {r.name}
              </button>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-[3px]">
            {rows.map((ri, k) => (
              <div key={k} className="flex items-center gap-2">
                <span className="w-5 text-right text-[0.625rem] tabular-nums text-ploy-text-secondary">{k}</span>
                <div
                  className="h-2.5 flex-1 rounded-[4px] transition-opacity duration-300"
                  style={{ background: gloss(reqs[ri].c), opacity: hover === ri ? 1 : 0.16 }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className={cn(GLASS, "flex flex-col justify-center px-4 py-4")}>
          <p className="text-[0.8125rem] text-ploy-text-secondary">{hover === 0 ? "your block sees" : `${reqs[hover].name}'s block sees`}</p>
          <Mono className="mt-1 block text-[1rem] font-medium text-ploy-text-primary">
            [{reqs[hover].n}, hidden]
          </Mono>
          <p className="mt-4 text-[0.8125rem] text-ploy-text-secondary">the whole slab</p>
          <Mono className="mt-1 block text-ploy-text-secondary">[{rows.length}, hidden]</Mono>
        </div>
      </div>
    </Figure>
  );
}

/* --------------------------------------------------------- taps throughput */

const TAPS: [string, number, number, number][] = [
  ["8B, 1 GPU", 92, 89, 96],
  ["8B, tp=4", 229, 213, 93],
  ["8B, tp=8", 313, 284, 91],
  ["70B, tp=8", 61, 58, 95],
];

function TapsThroughput() {
  const [ref, seen] = useInView<HTMLDivElement>();
  return (
    <Figure caption="Decode throughput in tokens per second, vanilla vLLM against the same engine with taps attached.">
      <div ref={ref} className="flex flex-col gap-3">
        {TAPS.map(([label, van, tap, pct], i) => (
          <div key={label} className={cn(GLASS, "grid grid-cols-[4.75rem_1fr_3rem] items-center gap-3 px-4 py-3 md:grid-cols-[6.5rem_1fr_3.5rem] md:px-5")}>
            <span className="text-[0.875rem] font-medium">{label}</span>
            <div className="flex flex-col gap-1.5">
              {[van, tap].map((v, k) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={cn("h-3 flex-1 rounded-full", TRACK)}>
                    <div
                      className="h-3 origin-left rounded-full transition-transform duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
                      style={{
                        width: `${(v / van) * 100}%`,
                        background: gloss(k ? GRAD : OLD),
                        transform: seen ? "scaleX(1)" : "scaleX(0)",
                        transitionDelay: `${i * 120 + k * 150}ms`,
                      }}
                    />
                  </div>
                  <span className="w-8 text-right text-[0.8125rem] tabular-nums text-ploy-text-secondary">{v}</span>
                </div>
              ))}
            </div>
            <span className="text-right font-heading text-[1.25rem] font-semibold tabular-nums tracking-[-0.01em] text-ploy-text-primary">{pct}%</span>
          </div>
        ))}
        <div className="flex gap-5 px-1 pt-1 text-[0.8125rem] text-ploy-text-secondary">
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: gloss(OLD) }} /> vanilla vLLM
          </span>
          <span className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: gloss(GRAD) }} /> with taps
          </span>
        </div>
      </div>
      <div className="sr-only"><table>
        <thead>
          <tr>
            <th />
            <th>vanilla vLLM</th>
            <th>with taps</th>
          </tr>
        </thead>
        <tbody>
          {TAPS.map(([l, a, b, pct]) => (
            <tr key={l}>
              <td>{l}</td>
              <td>{a} tok/s</td>
              <td>
                {b} ({pct}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table></div>
    </Figure>
  );
}

/* ------------------------------------------------------------ compare dots */

const LIBS = [
  { key: "eager", name: "nnsight eager", c: "#c99af5" },
  { key: "taps", name: "nnsight taps (CUDA graphs)", c: V },
  { key: "ie", name: "interp-engine vllm", c: "#8fb8e0" },
  { key: "ies", name: "interp-engine vllm-static", c: B },
  { key: "lens", name: "vLLM-Lens", c: "#8c8c96" },
] as const;

// tok/s per library, from the post's table; null = cannot express it.
const WORKLOADS: [string, number, (number | null)[]][] = [
  ["generate", 37, [30, 36, 29, 36, 32]],
  ["generate, 8 concurrent", 235, [200, 226, 203, 226, 214]],
  ["capture 1 layer, every step", 37, [27, 35, 29, 35, 28]],
  ["capture every layer, every step", 37, [23, 35, 7, 10, 10]],
  ["capture 1 layer, 8 concurrent", 235, [179, 220, 187, 212, 170]],
  ["additive steering, 1 layer", 37, [27, 35, 29, 35, 19]],
  ["logit lens every step", 37, [27, 35, 19, 22, 18]],
  ["linear probe every step", 37, [27, 35, 29, 35, 19]],
  ["zero one attention head every step", 37, [27, 35, null, null, null]],
  ["override the sampled token every step", 37, [27, 35, null, null, null]],
];

function CompareDots() {
  const [tip, setTip] = useState<{ w: number; l: number } | null>(null);
  const [ref, seen] = useInView<HTMLDivElement>(0.2);
  return (
    <Figure caption="Llama-3.1-70B, tensor-parallel 4. Each dot is a library's throughput as a share of plain vLLM generating the same tokens, so 100% means the tooling costs nothing. A cross means the library can't express that job.">
      <div ref={ref}>
        <div className="flex flex-wrap gap-x-4 gap-y-2 px-1 text-[0.8125rem] text-ploy-text-secondary">
          {LIBS.map((l) => (
            <span key={l.key} className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full" style={{ background: gloss(l.c) }} />
              {l.name}
            </span>
          ))}
        </div>
        <div className={cn(GLASS, "mt-4 flex flex-col px-4 pb-3 pt-1 md:px-5")}>
          {WORKLOADS.map(([name, base, vals], w) => (
            <div key={name} className="grid grid-cols-1 gap-1 border-b border-[rgb(20_20_28/0.07)] py-2.5 md:grid-cols-[13rem_1fr] md:items-center md:gap-4">
              <span className="text-[0.8125rem]">{name}</span>
              <div className="relative mx-2 h-5">
                <div className="absolute inset-y-[8px] left-0 right-0 rounded-full bg-[rgb(20_20_28/0.07)]" />
                {vals.map((v, l) => {
                  if (v === null) {
                    return (
                      <span
                        key={l}
                        className="absolute top-0 flex h-5 w-5 items-center justify-center"
                        style={{ left: `${l * 22}px`, color: LIBS[l].c }}
                        role="img"
                        aria-label={`${LIBS[l].name}: can't express it`}
                      >
                        <X className="size-4" strokeWidth={3} aria-hidden="true" />
                      </span>
                    );
                  }
                  const pct = (v / base) * 100;
                  const on = tip?.w === w && tip?.l === l;
                  return (
                    <button
                      key={l}
                      type="button"
                      onMouseEnter={() => setTip({ w, l })}
                      onMouseLeave={() => setTip(null)}
                      onFocus={() => setTip({ w, l })}
                      onBlur={() => setTip(null)}
                      aria-label={`${LIBS[l].name}: ${v} tok/s, ${Math.round(pct)}% of vanilla`}
                      className="absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full shadow-[0_2px_6px_-2px_rgb(20_20_28/0.45)] ring-2 ring-white transition-[left,transform] duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-125 focus-visible:scale-125"
                      style={{ left: seen ? `${pct}%` : "0%", background: gloss(LIBS[l].c), zIndex: on ? 5 : l === 1 ? 4 : 1 }}
                    >
                      {on && (
                        <span className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-[8px] border border-white bg-white/90 px-2.5 py-1 text-[0.75rem] text-ploy-text-primary shadow-[0_8px_20px_-10px_rgb(20_20_28/0.45)] backdrop-blur-xl">
                          {LIBS[l].name}: {v} tok/s · {Math.round(pct)}%
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          <div className="grid grid-cols-1 pt-2 md:grid-cols-[13rem_1fr] md:gap-4">
            <span />
            <div className="flex justify-between text-[0.75rem] tabular-nums text-ploy-text-secondary">
              <span>0%</span>
              <span>50%</span>
              <span>100%</span>
            </div>
          </div>
        </div>
      </div>
    </Figure>
  );
}

/* ------------------------------------------------------------ serve diagram */

function ServeDiagram() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const { step, replay } = useSteps(4, 650, seen);
  const clients = [
    ["NNsight trace", "a client that knows NNsight"],
    ["plain vLLM request", "never heard of NNsight"],
    ["HTTP client", "no GPU, via nnsight-serve"],
  ];
  return (
    <Figure
      caption={
        <>
          <Mono>model.edit()</Mono> installs a block once. Every request after it, from any client, runs with its own copy.
        </>
      }
    >
      <div ref={ref}>
        <div className="flex justify-end">
          <ReplayButton onClick={replay} />
        </div>
        <div className="mt-3 grid items-center gap-3 md:grid-cols-[1fr_2.5rem_1.1fr] md:gap-0">
          <div className="flex flex-col gap-2">
            {clients.map(([t, d], i) => (
              <div
                key={t}
                className={cn(GLASS, "px-4 py-2.5 transition-[opacity,transform] duration-500")}
                style={{ opacity: step > i ? 1 : 0.4, transform: step > i ? "none" : "translateX(-8px)" }}
              >
                <p className="text-[0.875rem] font-medium">{t}</p>
                <p className="text-[0.8125rem] text-ploy-text-secondary">{d}</p>
              </div>
            ))}
          </div>
          <div className="hidden h-px w-full bg-ploy-text-primary/20 md:block" />
          <div className={cn(GLASS, "rounded-[6px] bg-white/80 ring-1 ring-[rgb(20_20_28/0.12)]")}>
            <div className="px-4 py-4">
              <p className="text-[0.875rem] font-semibold">vLLM engine</p>
              <div className="mt-2 rounded-[6px] bg-[rgb(20_20_28/0.05)] px-3 py-2 font-mono text-[0.75rem] text-ploy-text-primary">installed block · edits=[...]</div>
              <div className="mt-3 flex flex-col gap-1.5">
                {clients.map(([t], i) => (
                  <div
                    key={t}
                    className="flex items-center gap-2 text-[0.8125rem] text-ploy-text-secondary transition-opacity duration-500"
                    style={{ opacity: step > i ? 1 : 0 }}
                  >
                    <span className="size-2 rounded-full" style={{ background: gloss(i === 0 ? V : i === 1 ? B : "#c99af5") }} />
                    own copy, own scope
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Figure>
  );
}

/* --------------------------------------------------------- release timeline */

function ReleaseTimeline() {
  const [ref, seen] = useInView<HTMLDivElement>();
  const items: { when: string; what: ReactNode; strong?: boolean }[] = [
    { when: "Today", what: <><Mono>pip install nnsight --pre</Mono>, local only</> },
    { when: "Tuesday, September 15", what: "Office hours, 11am Eastern" },
    { when: "Tuesday, September 22", what: "Office hours, 11am Eastern" },
    { when: "Beginning of October", what: <>Full release on NDIF with <Mono>remote=True</Mono></>, strong: true },
  ];
  return (
    <Figure caption="Until the full release, remote execution stays on v0.7.">
      <div ref={ref}>
        <ol className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {items.map((it, i) => (
            <li
              key={it.when}
              className="transition-[opacity,transform] duration-700"
              style={{ opacity: seen ? 1 : 0, transform: seen ? "none" : "translateY(10px)", transitionDelay: `${i * 140}ms` }}
            >
              {it.strong ? (
                <div className="h-full rounded-[6px] p-[1.5px] shadow-[0_16px_32px_-20px_rgb(20_20_28/0.5)]" style={{ background: `linear-gradient(135deg, ${V}, ${B})` }}>
                  <div className="h-full rounded-[12.5px] bg-white/[0.88] px-4 py-3.5 backdrop-blur-xl">
                    <p className="text-[0.875rem] font-semibold text-ploy-accent-primary">{it.when}</p>
                    <p className="mt-1 text-[0.875rem] leading-[1.5] text-ploy-text-secondary">{it.what}</p>
                  </div>
                </div>
              ) : (
                <div className={cn(GLASS, "h-full px-4 py-3.5")}>
                  <p className="text-[0.875rem] font-semibold">{it.when}</p>
                  <p className="mt-1 text-[0.875rem] leading-[1.5] text-ploy-text-secondary">{it.what}</p>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Figure>
  );
}

const REGISTRY: Record<string, () => ReactNode> = {
  anatomy: Anatomy,
  "model-classes": ModelClasses,
  "chunk-rows": ChunkRows,
  "engine-handoff": EngineHandoff,
  "overhead-bars": OverheadBars,
  "out-of-order": OutOfOrder,
  "source-explorer": SourceExplorer,
  "dtype-widths": DtypeWidths,
  "tp-gather": TpGather,
  "vllm-slab": VllmSlab,
  "taps-throughput": TapsThroughput,
  "compare-dots": CompareDots,
  "serve-diagram": ServeDiagram,
  "release-timeline": ReleaseTimeline,
};

/**
 * @ployComponent
 * @ployComponentId blog-post-viz
 * @ployComponentType section
 * @ployComponentTags blog, figure, diagram, chart, interactive
 * @ployComponentDescription Code-drawn figures a blog post places with `::viz <name>`: release anatomy stack, model class hub, chunked rows, thread vs greenlet handoff, overhead bars, out-of-order forward pass, .source explorer, dtype bit widths, tensor-parallel gather, vLLM token slab, taps throughput, library comparison dot plot, serve diagram and release timeline. Italic centered caption under each; plays once in view, with replay where it animates.
 * @ployComponentStatus stable
 */
export function PostViz({ name }: { name: string }) {
  const C = REGISTRY[name];
  return C ? <C /> : null;
}
