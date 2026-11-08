import { Button } from "@/components/design-system/ui/button";
import { Container } from "@/components/design-system/ui/container";
import { Heading } from "@/components/design-system/ui/heading";
import { CopyButton } from "./code-panel";

const ASSET = "/media/";

export const COMMUNITY = [
  { label: "Forum", href: "https://discuss.ndif.us/", icon: ASSET + "c36d080c-121218.svg" },
  { label: "GitHub", href: "https://github.com/ndif-team/nnsight", icon: ASSET + "853fd015-121218.svg" },
  { label: "Discord", href: "https://discord.gg/6uFJmCSwW7", icon: ASSET + "f2db9a48-121218.svg" },
  { label: "PyPI", href: "https://pypi.org/project/nnsight/", icon: ASSET + "c823c6a6-121218.svg" },
];

/**
 * Dark closing band: "Try it on your laptop" with Get Started and Docs, beside
 * a copyable pip install command and community links.
 */
export function HomeInstallCta() {
  return (
    <section className="relative isolate overflow-hidden bg-ploy-background-inverse text-white">
      <Container className="grid items-center gap-12 py-16 md:py-24 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-16">
        <div data-rise>
          <Heading level={2} className="max-w-[14ch] text-white">
            Try it on your laptop
          </Heading>
          <p className="mt-6 max-w-[30rem] text-[1.0625rem] leading-[1.6] text-white/65 md:text-[1.125rem]">
            The Quick Start uses GPT-2 and runs on your CPU. No GPU needed.
          </p>
          <div className="mt-9 flex flex-wrap gap-3">
            <Button href="/getting-started">Get Started</Button>
            <Button
              variant="outline"
              tone="light"
              href="/documentation"
              className="border-white/25 hover:border-white"
            >
              Docs
            </Button>
          </div>
        </div>
        <div data-rise>
          <div className="glass-dark flex items-center gap-3 rounded-[6px] py-3 pl-5 pr-2 md:py-6 md:pl-6 md:pr-3">
            <code className="min-w-0 flex-1 whitespace-nowrap font-mono text-[1rem] tracking-[-0.01em] sm:text-[1.25rem] md:text-[1.375rem]">
              <span className="select-none text-white/60">$ </span>pip install nnsight
            </code>
            <CopyButton value="pip install nnsight" />
          </div>
          <ul className="mt-6 flex flex-wrap gap-x-8 gap-y-3">
            {COMMUNITY.map((c) => (
              <li key={c.label}>
                <a
                  href={c.href}
                  className="flex items-center gap-2 py-1 text-[0.9375rem] font-medium text-white/65 transition-colors hover:text-white"
                >
                  <img
                    src={c.icon}
                    alt=""
                    width={18}
                    height={18}
                    loading="lazy"
                    className="size-[18px] invert"
                  />
                  {c.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
