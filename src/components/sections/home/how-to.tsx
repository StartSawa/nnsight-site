import { Button } from "@/components/design-system/ui/button";
import { Container } from "@/components/design-system/ui/container";
import { Heading } from "@/components/design-system/ui/heading";
import { docUrl } from "@/lib/docs-links";
import { CodeLines, CopyButton } from "./code-panel";

const INTERVENE = `from nnsight import TransformersModel

model = TransformersModel('openai-community/gpt2', device_map='auto', dispatch=True)

prompt = 'The Eiffel Tower is in the city of'

with model.trace(prompt):
    # Read a hidden state out of the forward pass
    hidden_states = model.transformer.h[-1].output.save()
    clean = model.output.logits[0, -1].argmax(dim=-1).save()

with model.trace(prompt):
    # Zero one layer at the last position and see what changes
    model.transformer.h[5].output[:, -1, :] = 0
    ablated = model.output.logits[0, -1].argmax(dim=-1).save()

print(hidden_states.shape)                       # torch.Size([1, 10, 768])
print(model.tokenizer.decode(clean))             # ' Paris'
print(model.tokenizer.decode(ablated))           # ','`;

/**
 * @ployComponent
 * @ployComponentId home-how-to
 * @ployComponentType section
 * @ployComponentTags code, install, remote, dark
 * @ployComponentDescription Dark "What does that look like?" band: copyable pip install line, the full GPT-2 trace example with highlighted outputs, then the remote=True line and a Remote Execution button.
 * @ployComponentStatus stable
 */
export function HomeHowTo() {
  return (
    <section className="relative isolate overflow-hidden bg-ploy-background-inverse py-14 text-white md:py-24">
      <Container>
        <div data-rise>
          <Heading level={2} className="text-white">
            Here's what it looks like
          </Heading>
        </div>

        <div data-rise className="mt-12">
          <div className="overflow-hidden rounded-[6px] border border-white/[0.14] bg-white/[0.06] shadow-[inset_0_1px_0_rgb(255_255_255/0.08),0_30px_60px_-30px_rgb(0_0_0/0.6)]">
            <div className="flex flex-wrap items-center gap-x-4 border-b border-white/[0.07] px-5 py-2 md:flex-nowrap md:px-6 md:py-3">
              <span className="w-full pt-1 text-[0.8125rem] text-white/50 md:w-auto md:shrink-0 md:whitespace-nowrap md:pt-0">
                Install NNSight:
              </span>
              <code className="min-w-0 flex-1 whitespace-nowrap font-mono text-[0.8125rem] text-white md:text-[0.875rem]">
                <span className="select-none text-white/60">$ </span>pip
                install nnsight
              </code>
              <CopyButton value="pip install nnsight" />
            </div>
            <div className="px-1 pb-6 pt-4 md:px-2 md:pb-8">
              <p className="px-5 pb-3 text-[0.8125rem] text-white/50 md:px-6">
                Intervene:
              </p>
              <CodeLines
                code={INTERVENE}
                highlight={{ 18: "violet", 19: "blue" }}
              />
            </div>
          </div>
        </div>

        <div data-rise className="mt-12 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <p className="max-w-[40rem] text-[1.5rem] font-semibold leading-[1.2] tracking-[-0.025em] md:text-[1.625rem]">
            Model too big for your laptop? Add{" "}
            <code className="rounded-[4px] bg-white/10 px-2 py-0.5 font-mono text-[0.85em] font-medium tracking-[-0.02em] ring-1 ring-white/15">
              remote=True
            </code>{" "}
            and it runs on{" "}
            <a
              href="https://ndif.us/"
              className="underline decoration-white/30 underline-offset-[6px] transition-colors hover:decoration-white"
            >
              NDIF
            </a>
            .
          </p>
          <Button
            href={docUrl("/features/15_remote_execution")}
            className="self-start md:self-auto"
          >
            Remote Execution
          </Button>
        </div>
      </Container>
    </section>
  );
}
