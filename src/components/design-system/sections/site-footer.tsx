import { Logo } from "../ui/logo";
import { Container } from "../ui/container";

const ASSET = "/media/";

const COLUMNS: { title: string; links: [string, string][] }[] = [
  {
    title: "Learn",
    links: [
      ["Getting Started", "/getting-started"],
      ["Documentation", "/documentation"],
      ["Features", "/features"],
      ["Tutorials", "/tutorials"],
    ],
  },
  {
    title: "nnsight",
    links: [
      ["vLLM", "/vllm"],
      ["Blog", "/blog"],
      ["Status", "/status"],
      ["About", "/about"],
    ],
  },
  {
    title: "Community",
    links: [
      ["GitHub", "https://github.com/ndif-team/nnsight"],
      ["Forum", "https://discuss.ndif.us/"],
      ["Discord", "https://discord.gg/6uFJmCSwW7"],
      ["PyPI", "https://pypi.org/project/nnsight/"],
    ],
  },
];

const ICONS = [
  { label: "GitHub", href: "https://github.com/ndif-team/nnsight", icon: ASSET + "853fd015-121218.svg" },
  { label: "Forum", href: "https://discuss.ndif.us/", icon: ASSET + "c36d080c-121218.svg" },
  { label: "Discord", href: "https://discord.gg/6uFJmCSwW7", icon: ASSET + "f2db9a48-121218.svg" },
  { label: "PyPI", href: "https://pypi.org/project/nnsight/", icon: ASSET + "c823c6a6-121218.svg" },
];

/**
 * @ployComponent
 * @ployComponentId site-footer
 * @ployComponentType section
 * @ployComponentTags footer, navigation, community
 * @ployComponentDescription Site footer: NN logo, three link columns (Learn, nnsight, Community), social icons and the copyright line.
 * @ployComponentStatus stable
 */
export function SiteFooter() {
  return (
    <footer data-ploy-component="site-footer" className="bg-ploy-background-primary">
      <Container className="pb-10 pt-16 md:pt-20">
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 md:grid-cols-[minmax(0,1.4fr)_repeat(3,minmax(0,1fr))] md:gap-12">
          <div className="col-span-2 md:col-span-1">
            <a href="/" aria-label="nnsight home" className="inline-flex items-center gap-2.5">
              <Logo width={43} height={26} alt="" />
              <span className="text-[1.125rem] font-semibold tracking-[-0.02em] text-ploy-text-primary">
                nnsight
              </span>
            </a>
          </div>
          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="text-[0.875rem] font-semibold text-ploy-text-primary">{col.title}</p>
              <ul className="mt-3 flex flex-col gap-0.5 md:mt-4 md:gap-1">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <a
                      href={href}
                      className="inline-block py-1.5 text-[0.9375rem] text-ploy-text-secondary transition-colors hover:text-ploy-text-primary md:py-0.5"
                    >
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="mt-16 flex flex-col-reverse gap-6 border-t border-ploy-border-primary pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[0.875rem] text-ploy-text-secondary">Copyright © 2026 nnsight</p>
          <ul className="flex items-center gap-1">
            {ICONS.map((i) => (
              <li key={i.label}>
                <a
                  href={i.href}
                  aria-label={i.label}
                  className="inline-flex size-10 items-center justify-center rounded-[6px] opacity-70 transition-[opacity,background-color] hover:bg-ploy-background-secondary hover:opacity-100"
                >
                  <img src={i.icon} alt="" width={18} height={18} className="size-[18px] dark:invert" />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </footer>
  );
}
