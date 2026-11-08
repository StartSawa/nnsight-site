import { Container } from "@/components/design-system/ui/container";
import { Heading } from "@/components/design-system/ui/heading";
import { Text } from "@/components/design-system/ui/text";
import { cn } from "@/lib/utils";

type Mode = "access" | "modify" | "gradients" | "batching";

/** GPT-2: 12 transformer blocks, h[0] to h[11]. */
const LAYERS = 12;
const TOKENS = 5;
const layers = Array.from({ length: LAYERS }, (_, l) => l);
const gray = (l: number, t = 0) => `rgb(var(--cell) / ${0.1 + (((l * 7 + t * 3) % 9) / 9) * 0.2})`;

function LayerTicks() {
  return (
    <div className="mt-1.5 flex justify-between font-mono text-[0.625rem] text-ploy-text-secondary">
      <span>h[0]</span>
      <span>h[-1]</span>
    </div>
  );
}

/** Read one layer's output and keep it as a tensor. */
function AccessVisual() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-[52px] gap-[3px]">
        {layers.map((l) => (
          <span
            key={l}
            data-cell
            data-layer={l}
            className="flex-1 origin-bottom rounded-[3px]"
            style={{ backgroundColor: l === LAYERS - 1 ? "#a134eb" : gray(l) }}
          />
        ))}
      </div>
      <LayerTicks />
      <div className="mt-auto flex h-[44px] items-end gap-[2px] rounded-[6px] bg-[#a134eb]/[0.06] px-2 py-1.5">
        {Array.from({ length: 36 }).map((_, i) => (
          <span
            key={i}
            data-cell
            data-layer={LAYERS - 1}
            data-late=""
            className="flex-1 origin-bottom rounded-[1px] bg-[#a134eb]/70"
            style={{ height: `${18 + (((i * 37) % 23) / 23) * 82}%` }}
          />
        ))}
      </div>
    </div>
  );
}

/** Zero h[5] at the last token; the downstream states and the prediction change. */
function ModifyVisual() {
  return (
    <div className="flex h-full flex-col">
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${LAYERS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: TOKENS * LAYERS }).map((_, i) => {
          const l = i % LAYERS;
          const t = Math.floor(i / LAYERS);
          const last = t === TOKENS - 1;
          const zeroed = last && l === 5;
          const changed = last && l > 5;
          return (
            <span
              key={i}
              data-cell
              data-layer={l}
              data-late={zeroed || changed ? "" : undefined}
              className={cn(
                "h-[13px] rounded-[3px]",
                zeroed && "ring-[1.5px] ring-inset ring-[#a134eb]",
              )}
              style={{
                backgroundColor: zeroed
                  ? "transparent"
                  : changed
                    ? "rgb(161 52 235 / 0.28)"
                    : gray(l, t),
              }}
            />
          );
        })}
      </div>
      <div className="mt-auto flex items-center gap-2 font-mono text-[0.75rem]">
        <span
          data-cell
          data-layer={LAYERS - 1}
          className="rounded-[5px] bg-ploy-background-secondary px-2 py-1 text-ploy-text-secondary line-through decoration-ploy-text-secondary/50"
        >
          ' Paris'
        </span>
        <span
          data-cell
          data-layer={LAYERS - 1}
          data-late=""
          className="rounded-[5px] bg-[#a134eb]/10 px-2 py-1 text-[#8a24cf] dark:text-ploy-accent-primary"
        >
          ','
        </span>
      </div>
    </div>
  );
}

/** Gradient size at each layer, flowing backward from the output. */
function GradientsVisual() {
  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-1 items-end gap-[3px] border-b border-ploy-text-primary/10">
        {layers.map((l) => {
          const t = l / (LAYERS - 1);
          return (
            <span
              key={l}
              data-cell
              data-layer={l}
              className="flex-1 origin-bottom rounded-t-[3px]"
              style={{
                height: `${16 + Math.pow(t, 1.6) * 80 + ((l * 5) % 3) * 2}%`,
                backgroundColor: `rgb(67 133 190 / ${0.25 + t * 0.7})`,
              }}
            />
          );
        })}
      </div>
      <LayerTicks />
    </div>
  );
}

/** One intervention at h[5], applied to every prompt in the batch. */
function BatchingVisual() {
  return (
    <div className="relative flex h-full flex-col justify-center gap-[10px]">
      {[0, 1, 2].map((b) => (
        <div key={b} data-stack className="flex items-center gap-3">
          <span className="w-6 shrink-0 font-mono text-[0.6875rem] text-ploy-text-secondary">
            [{b}]
          </span>
          <div className="flex h-[24px] flex-1 gap-[3px]">
            {layers.map((l) => (
              <span
                key={l}
                data-cell
                data-layer={l}
                data-late={l === 5 ? "" : undefined}
                className="flex-1 rounded-[3px]"
                style={{ backgroundColor: l === 5 ? "#a134eb" : gray(l, b * 2) }}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function Visual({ mode }: { mode: Mode }) {
  if (mode === "access") return <AccessVisual />;
  if (mode === "modify") return <ModifyVisual />;
  if (mode === "gradients") return <GradientsVisual />;
  return <BatchingVisual />;
}


const CAPABILITIES: {
  mode: Mode;
  title: string;
  rest: string;
  caption?: string;
}[] = [
  {
    mode: "access",
    title: "See activations",
    rest: "look at the values inside any layer",
    caption: "model.transformer.h[-1].output.save()",
  },
  {
    mode: "modify",
    title: "Change activations",
    rest: "edit values and see how the output changes",
    caption: "model.transformer.h[5].output[:, -1, :] = 0",
  },
  {
    mode: "gradients",
    title: "Get gradients",
    rest: "for any value inside the model",
    caption: "hidden.grad.save()",
  },
  {
    mode: "batching",
    title: "Run batches",
    rest: "test many inputs in one run",
    caption: "with tracer.invoke(prompt):",
  },
];

/**
 * @ployComponent
 * @ployComponentId home-what-is
 * @ployComponentType section
 * @ployComponentTags intro, capabilities, diagram
 * @ployComponentDescription "What is NNsight?" intro with four capability cards, each with its own GPT-2 diagram that plays once in view: h[-1] saved as a tensor, h[5] zeroed at the last token flipping ' Paris' to ',', gradient size per layer flowing backward, and one h[5] intervention across a batch of three prompts.
 * @ployComponentStatus stable
 */
export function HomeWhatIs() {
  return (
    <section className="relative isolate overflow-hidden py-14 md:py-24">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:items-end lg:gap-16">
          <div data-rise>
            <Heading level={2} className="max-w-[16ch] text-ploy-text-primary">
              What you can do with NNsight
            </Heading>
          </div>
          <div data-rise>
            <Text className="text-ploy-text-secondary">
              Add a few lines to your PyTorch code and see every layer of your
              model. Built by the{" "}
              <a
                href="https://ndif.us/"
                className="font-medium text-ploy-accent-primary underline decoration-ploy-accent-primary/30 underline-offset-4 transition-colors hover:decoration-ploy-accent-primary"
              >
                NDIF team
              </a>{" "}
              at Northeastern University.
            </Text>
          </div>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 md:mt-12 lg:grid-cols-4">
          {CAPABILITIES.map((c) => (
            <div key={c.mode}>
              <article
                data-card={c.mode}
                className="glass group flex h-full flex-col overflow-hidden rounded-[6px]"
              >
                <div className="relative border-b border-ploy-border-primary px-6 pb-5 pt-6">
                  <div className="h-[150px]">
                    <Visual mode={c.mode} />
                  </div>
                </div>
                <div className="flex flex-1 flex-col px-6 pb-6 pt-5">
                  <h3 className="text-[1.1875rem] font-semibold tracking-[-0.02em] text-ploy-text-primary">
                    {c.title}
                  </h3>
                  <p className="mt-1.5 text-[0.9375rem] leading-[1.5] text-ploy-text-secondary">
                    {c.rest[0].toUpperCase() + c.rest.slice(1)}.
                  </p>
                  {c.caption ? (
                    <code className="mt-auto block truncate pt-5 font-mono text-[0.75rem] text-ploy-accent-primary">
                      {c.caption}
                    </code>
                  ) : null}
                </div>
              </article>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
