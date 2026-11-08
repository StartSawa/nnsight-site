import { Button } from "@/components/design-system/ui/button";
import { Container } from "@/components/design-system/ui/container";
import { DisplayHeading } from "@/components/design-system/ui/display-heading";
import { Logo } from "@/components/design-system/ui/logo";
import { Text } from "@/components/design-system/ui/text";
import { CopyButton } from "@/components/sections/home/code-panel";

const WORKS_WITH = ["PyTorch", "Hugging Face", "diffusers", "vLLM"];

/**
 * Left-aligned headline, intro, CTAs, a copyable install line and framework
 * list beside the NN logo, at nnsight.net's sizes (350, 400 and 550px wide).
 */
export function HomeHero() {
  return (
    <section className="relative isolate overflow-hidden">
      <Container className="grid items-center gap-6 pb-12 pt-8 md:pb-16 md:pt-12 lg:min-h-[min(calc(100svh-120px),680px)] lg:grid-cols-[minmax(0,1fr)_minmax(0,1.12fr)] lg:gap-4 lg:py-10">
        <div className="relative z-10 max-w-[36rem]">
          <DisplayHeading
            size={2}
            as="h1"
            className="text-ploy-text-primary md:text-[3rem] xl:text-[3.25rem]"
          >
            Interpretability for Neural Networks
          </DisplayHeading>
          <Text
            variant="lead"
            className="mt-6 text-pretty text-ploy-text-secondary md:text-[1.0625rem]"
          >
            <strong className="font-semibold text-ploy-text-primary">NNsight</strong>{" "}
            (/ɛn.saɪt/) is a package for interpreting and manipulating the
            internals of deep learning models.
          </Text>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button href="/getting-started">Get Started</Button>
            <Button variant="secondary" href="/documentation">
              Docs
            </Button>
          </div>
          <div className="mt-8 flex w-full max-w-[22rem] items-center gap-3 rounded-[4px] border border-ploy-border-primary bg-ploy-background-primary py-1.5 pl-4 pr-1.5">
            <code className="min-w-0 flex-1 whitespace-nowrap font-mono text-[0.9375rem] text-ploy-text-primary">
              <span className="select-none text-ploy-text-secondary">$ </span>
              pip install nnsight
            </code>
            <CopyButton value="pip install nnsight" tone="light" />
          </div>
          <p className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.875rem] text-ploy-text-secondary">
            <span>Works with</span>
            {WORKS_WITH.map((name) => (
              <span key={name} className="font-medium text-ploy-text-primary">
                {name}
              </span>
            ))}
          </p>
        </div>
        <div className="mx-auto w-full max-w-[350px] md:max-w-[400px] lg:ml-auto lg:mr-0 lg:max-w-[550px]">
          <Logo width={550} alt="NNsight Logo" fetchPriority="high" />
        </div>
      </Container>
    </section>
  );
}
