"use client";

import { useState } from "react";
import { Menu, Moon, Sun, X } from "lucide-react";
import { NavbarDialog } from "./navbar";
import { Input } from "./input";
import { Text } from "./text";
import { Logo } from "./logo";
import { ICONS } from "./icons";
import { cn } from "@/lib/utils";

export type SiteNavItem = { label: string; href: string };
export const sourceNavItems: SiteNavItem[] = [
  { label: "Getting Started", href: "/getting-started" },
  { label: "Documentation", href: "/documentation" },
  { label: "Features", href: "/features" },
  { label: "vLLM", href: "/vllm" },
  { label: "Tutorials", href: "/tutorials" },
  { label: "Blog", href: "/blog" },
  { label: "About", href: "/about" },
];

export const siteNavLinks = {
  home: "/",
  forum: "https://discuss.ndif.us/",
  community: "https://forms.gle/1Y6myaXYzSh3oHf56",
  repository: "https://github.com/ndif-team/nnsight",
  status: "/status",
  statusImage:
    "/media/42226909-ndif-light.webp",
};

/** Shared calm focus ring and color transition for every nav control. */
export const navFocus =
  "outline-hidden focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-2 focus-visible:outline-ploy-accent-primary";
const navMotion = "transition-[color,background-color,opacity,border-color] duration-150 ease-out";

/**
 * @ployComponent
 * @ployComponentId site-nav-destinations
 * @ployComponentType component
 * @ployComponentDescription Shared destination labels for the NNsight desktop bar and mobile drawer.
 * @ployComponentStatus stable
 */
export function SiteNavDestinations({
  items = sourceNavItems,
  mobile = false,
  onNavigate,
}: {
  items?: SiteNavItem[];
  mobile?: boolean;
  onNavigate?: () => void;
} = {}) {
  return (
    <>
      {items.map((item) => (
        <a
          key={item.href}
          href={item.href}
          onClick={onNavigate}
          className={cn(
            navFocus,
            navMotion,
            mobile
              ? "flex items-center justify-between border-b border-ploy-border-primary py-3.5 font-body text-[17px] leading-6 font-medium text-ploy-text-primary hover:text-ploy-accent-primary"
              : "block shrink-0 rounded-[4px] px-2.5 py-1.5 font-body text-[14.5px] leading-5 font-medium whitespace-nowrap text-ploy-text-secondary hover:bg-ploy-background-secondary hover:text-ploy-text-primary",
          )}
        >
          {item.label}
          {mobile ? (
            <span aria-hidden="true" className="text-ploy-text-secondary">
              →
            </span>
          ) : null}
        </a>
      ))}
    </>
  );
}

function RepoFacts({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "flex items-center gap-2 font-mono text-[11.5px] leading-[14px] text-ploy-text-secondary",
        className,
      )}
    >
      <span className="inline-flex items-center gap-[3px] whitespace-nowrap">
        <ICONS.m0b1a7ff95162 className="!h-3 !w-3 opacity-60" />
        v0.8.2
      </span>
      <span className="inline-flex items-center gap-[3px] whitespace-nowrap">
        <ICONS.m6e7d484f9f98 className="!h-3 !w-3 opacity-60" />
        1.1k
      </span>
      <span className="inline-flex items-center gap-[3px] whitespace-nowrap">
        <ICONS.m5fed8fee0b58 className="!h-3 !w-3 opacity-60" />
        135
      </span>
    </span>
  );
}

export function SiteNavRepository() {
  return (
    <a
      href={siteNavLinks.repository}
      className={cn(
        navFocus,
        navMotion,
        "group hidden h-10 shrink-0 items-center gap-2.5 rounded-[4px] px-2.5 hover:bg-ploy-background-secondary min-[960px]:flex",
      )}
      aria-label="ndif-team/nnsight on GitHub, version v0.8.2, 1.1k stars, 135 forks"
    >
      <ICONS.i5 className="!h-5 !w-5 shrink-0 opacity-80 transition-opacity duration-150 group-hover:opacity-100" />
      <span className="flex min-w-0 flex-col gap-[3px]">
        <span className="block font-body text-[13px] leading-[15px] font-medium whitespace-nowrap text-ploy-text-primary">
          ndif-team/nnsight
        </span>
        <RepoFacts />
      </span>
    </a>
  );
}

type SearchEntry = { title: string; section: string; href: string };
let searchIndex: Promise<SearchEntry[]> | null = null;
const loadSearchIndex = () =>
  (searchIndex ??= fetch("/search-index.json")
    .then((r) => (r.ok ? r.json() : []))
    .catch(() => []));

/** Titles first, then section names; every query word must appear. */
function searchPages(entries: SearchEntry[], query: string) {
  const q = query.trim().toLowerCase();
  const words = q.split(/\s+/).filter(Boolean);
  if (!words.length) return [];
  const rank = (e: SearchEntry) => {
    const t = e.title.toLowerCase();
    return t.startsWith(q) ? 0 : t.includes(q) ? 1 : 2;
  };
  return entries
    .filter((e) => words.every((w) => `${e.title} ${e.section}`.toLowerCase().includes(w)))
    .sort((a, b) => rank(a) - rank(b) || a.title.length - b.title.length)
    .slice(0, 8);
}

export function SiteNavSearch({ expanded = false }: { expanded?: boolean }) {
  const [query, setQuery] = useState("");
  const [entries, setEntries] = useState<SearchEntry[]>([]);
  const [open, setOpen] = useState(false);
  const results = searchPages(entries, query);
  const warm = () => void loadSearchIndex().then(setEntries);
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        if (results[0]) window.location.href = results[0].href;
      }}
      onFocus={() => {
        warm();
        setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) setOpen(false);
      }}
      onKeyDown={(event) => {
        if (event.key === "Escape") setOpen(false);
      }}
      className="relative w-full"
    >
      <span className="pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 opacity-45">
        <ICONS.i1 className={expanded ? "!h-5 !w-5" : "!h-[18px] !w-[18px]"} />
      </span>
      <Input
        aria-label="Search NNsight"
        name="q"
        type="search"
        placeholder="Search docs"
        autoFocus={expanded}
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className={cn(
          navMotion,
          "w-full rounded-[4px] border-ploy-border-primary bg-ploy-background-secondary py-0 pr-8 font-body text-ploy-text-primary placeholder:text-ploy-text-secondary hover:border-ploy-input-border focus:bg-ploy-background-primary [&::-webkit-search-cancel-button]:appearance-none",
          expanded
            ? "h-11 pl-10 text-[16px] leading-[44px]"
            : "h-9 pl-9 text-[14px] leading-9",
        )}
      />
      {query ? (
        <button
          type="button"
          onClick={() => setQuery("")}
          aria-label="Clear search"
          className={cn(
            navFocus,
            "absolute top-1/2 right-1.5 flex h-6 w-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[6px] opacity-50 transition-opacity duration-150 hover:opacity-90",
          )}
        >
          <ICONS.i2 className="!h-4 !w-4" />
        </button>
      ) : null}
      {open && query.trim() ? (
        <div className="absolute top-full right-0 left-0 z-50 mt-1.5 min-w-[18rem] overflow-hidden rounded-[4px] border border-ploy-border-primary bg-ploy-background-primary shadow-[0_16px_40px_-16px_rgb(14_14_20/0.25)]">
          {results.length ? (
            <ul className="py-1">
              {results.map((r) => (
                <li key={r.href}>
                  <a
                    href={r.href}
                    className="flex items-baseline justify-between gap-3 px-3 py-2 hover:bg-ploy-background-secondary focus:bg-ploy-background-secondary focus:outline-none"
                  >
                    <span className="truncate font-body text-[14px] font-medium text-ploy-text-primary">
                      {r.title}
                      {/^https?:/.test(r.href) ? (
                        <span className="ml-1 text-[12px] text-ploy-text-secondary/60">↗</span>
                      ) : null}
                    </span>
                    <span className="shrink-0 font-body text-[12px] text-ploy-text-secondary">{r.section}</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="px-3 py-3 font-body text-[14px] text-ploy-text-secondary">No pages match.</p>
          )}
        </div>
      ) : null}
    </form>
  );
}

const iconButton = cn(
  navFocus,
  navMotion,
  "group flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-[4px] text-ploy-text-primary hover:bg-ploy-background-secondary",
);
const iconGlyph =
  "!h-5 !w-5 opacity-70 transition-opacity duration-150 group-hover:opacity-100";

/** Works before the nav hydrates: the script in Layout.astro listens for clicks. */
export function SiteNavThemeToggle() {
  return (
    <button
      type="button"
      data-theme-toggle
      aria-label="Switch between light and dark mode"
      title="Switch between light and dark mode"
      className={iconButton}
    >
      <Moon strokeWidth={1.75} className={cn(iconGlyph, "dark:hidden")} />
      <Sun strokeWidth={1.75} className={cn(iconGlyph, "hidden dark:block")} />
    </button>
  );
}

export function SiteNavCommunity() {
  return (
    <div className="flex shrink-0 items-center gap-0.5">
      <a
        href={siteNavLinks.forum}
        aria-label="NNsight discussion forum"
        title="Discussion forum"
        className={iconButton}
      >
        <ICONS.i3 className={iconGlyph} />
      </a>
      <a
        href={siteNavLinks.community}
        aria-label="Join the NNsight community"
        title="Join the community"
        className={iconButton}
      >
        <ICONS.i4 className={iconGlyph} />
      </a>
    </div>
  );
}

export function SiteNavStatus({ className = "" }: { className?: string }) {
  return (
    <a
      href={siteNavLinks.status}
      aria-label="NDIF service status"
      title="NDIF service status"
      className={cn(
        navFocus,
        "relative flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#249224] ring-1 ring-ploy-border-primary ring-offset-2 ring-offset-ploy-background-primary transition-[background-color] duration-150 hover:bg-[#2fc02f]",
        className,
      )}
    >
      <img
        src={siteNavLinks.statusImage}
        alt="NDIF"
        width={32}
        height={32}
        className="relative z-[1] h-full w-full"
      />
    </a>
  );
}

export function SiteNavMobile({
  items = sourceNavItems,
}: {
  items?: SiteNavItem[];
}) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  return (
    <NavbarDialog.Root open={open} onOpenChange={setOpen}>
      <NavbarDialog.Trigger asChild>
        <button
          type="button"
          data-mobile-menu-trigger
          aria-label="Open navigation"
          className={cn(iconButton, "-ml-1.5 h-10 w-10 min-[1220px]:hidden")}
        >
          <Menu size={20} strokeWidth={1.75} />
        </button>
      </NavbarDialog.Trigger>
      <NavbarDialog.Portal>
        <NavbarDialog.Content
          data-mobile-menu
          aria-describedby={undefined}
          className="fixed inset-0 z-[71] flex flex-col overflow-y-auto overscroll-contain bg-ploy-background-primary text-ploy-text-primary"
        >
          <div className="sticky top-0 z-[1] flex h-14 shrink-0 items-center justify-between border-b border-ploy-border-primary bg-ploy-background-primary px-5">
            <a
              href={siteNavLinks.home}
              aria-label="NNsight home"
              onClick={close}
              className={cn(navFocus, "flex items-center gap-2.5 rounded-[6px]")}
            >
              <Logo width={40} height={24} alt="" />
              <NavbarDialog.Title asChild>
                <span className="font-heading text-[16px] font-semibold tracking-[-0.01em]">
                  NNsight
                </span>
              </NavbarDialog.Title>
            </a>
            <NavbarDialog.Close asChild>
              <button
                type="button"
                aria-label="Close navigation"
                className={cn(iconButton, "-mr-1.5 h-10 w-10")}
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </NavbarDialog.Close>
          </div>
          <div className="flex flex-1 flex-col gap-6 px-5 pt-5 pb-8">
            <SiteNavSearch />
            <nav aria-label="Mobile navigation" className="flex flex-col">
              <SiteNavDestinations items={items} mobile onNavigate={close} />
            </nav>
            <div className="flex flex-col gap-1">
              <Text
                as="span"
                variant="small"
                className="mb-1 text-[12px] font-medium tracking-[0.04em] text-ploy-text-secondary uppercase"
              >
                Community
              </Text>
              <a
                href={siteNavLinks.forum}
                onClick={close}
                className={cn(navFocus, navMotion, "group -mx-2 flex items-center gap-3 rounded-[4px] px-2 py-2.5 font-body text-[15px] font-medium hover:bg-ploy-background-secondary")}
              >
                <ICONS.i3 className={iconGlyph} />
                Discussion forum
              </a>
              <a
                href={siteNavLinks.community}
                onClick={close}
                className={cn(navFocus, navMotion, "group -mx-2 flex items-center gap-3 rounded-[4px] px-2 py-2.5 font-body text-[15px] font-medium hover:bg-ploy-background-secondary")}
              >
                <ICONS.i4 className={iconGlyph} />
                Join the community
              </a>
              <a
                href={siteNavLinks.repository}
                onClick={close}
                aria-label="ndif-team/nnsight on GitHub, version v0.8.2, 1.1k stars, 135 forks"
                className={cn(navFocus, navMotion, "group -mx-2 flex items-center gap-3 rounded-[4px] px-2 py-2.5 hover:bg-ploy-background-secondary")}
              >
                <ICONS.i5 className={iconGlyph} />
                <span className="flex flex-col gap-1">
                  <span className="font-body text-[15px] leading-[18px] font-medium">
                    ndif-team/nnsight
                  </span>
                  <RepoFacts />
                </span>
              </a>
              <a
                href={siteNavLinks.status}
                onClick={close}
                className={cn(navFocus, navMotion, "-mx-2 flex items-center gap-3 rounded-[4px] px-2 py-2.5 font-body text-[15px] font-medium hover:bg-ploy-background-secondary")}
              >
                <span className="relative flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-[#249224]">
                  <img src={siteNavLinks.statusImage} alt="" width={20} height={20} className="h-full w-full" />
                </span>
                NDIF service status
              </a>
            </div>
          </div>
        </NavbarDialog.Content>
      </NavbarDialog.Portal>
    </NavbarDialog.Root>
  );
}

export function SiteNavSearchDialog() {
  return (
    <NavbarDialog.Root>
      <NavbarDialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open search"
          className={cn(iconButton, "h-10 w-10 min-[960px]:hidden")}
        >
          <ICONS.i1 className={iconGlyph} />
        </button>
      </NavbarDialog.Trigger>
      <NavbarDialog.Portal>
        <NavbarDialog.Overlay className="fixed inset-0 z-[70] bg-ploy-neutral-dark/25" />
        <NavbarDialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 top-0 z-[71] border-b border-ploy-border-primary bg-ploy-background-primary px-5 pt-3 pb-5 shadow-[0_12px_32px_-16px_rgb(14_14_20/0.25)]"
        >
          <div className="mb-3 flex h-10 items-center justify-between">
            <NavbarDialog.Title asChild>
              <span className="font-heading text-[16px] font-semibold">
                Search
              </span>
            </NavbarDialog.Title>
            <NavbarDialog.Close asChild>
              <button
                type="button"
                aria-label="Close search"
                className={cn(iconButton, "-mr-1.5 h-10 w-10")}
              >
                <X size={20} strokeWidth={1.75} />
              </button>
            </NavbarDialog.Close>
          </div>
          <SiteNavSearch expanded />
        </NavbarDialog.Content>
      </NavbarDialog.Portal>
    </NavbarDialog.Root>
  );
}
