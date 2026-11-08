"use client";

import { useEffect, useState } from "react";
import { Logo } from "../ui/logo";
import { NavbarSkipLink } from "../ui/navbar";
import {
  SiteNavCommunity,
  SiteNavDestinations,
  SiteNavMobile,
  SiteNavRepository,
  SiteNavSearch,
  SiteNavSearchDialog,
  SiteNavStatus,
  SiteNavThemeToggle,
  navFocus,
  siteNavLinks,
  sourceNavItems,
  type SiteNavItem,
} from "../ui/site-nav-content";

export type SiteNavProps = {
  /** Normal document flow by default. Sticky lets the 32px announcement scroll away before the bar sticks at top:0. */
  position?: "static" | "sticky";
  items?: SiteNavItem[];
  announcement?: string;
  announcementLinkLabel?: string;
  announcementHref?: string;
  className?: string;
};

/**
 * @ployComponent
 * @ployComponentId site-nav
 * @ployComponentType section
 * @ployComponentTags navigation, header, announcement, responsive
 * @ployComponentDescription NNsight slim dark announcement strip and clean white header with seven destination links, search, community links, repository facts and service status. Turns translucent with a soft blur and hairline border once scrolled.
 * @ployComponentStatus stable
 *
 * Reserves 32px (strip) + 60px (bar). position="sticky" uses a -32px offset so
 * only the bar stays at the viewport top once the strip scrolls away; no page
 * spacer is required. Desktop destinations are direct links (no dropdowns).
 * Below 1220px the menu button opens a full-viewport drawer that reaches every
 * link, search, community, repository and status; below 960px search moves
 * into its own dialog. Both dialogs have Close controls, focus trapping and
 * Escape handling. Pages provide <main id="main-content" tabIndex={-1}> for
 * the first-focusable skip link.
 */
export function SiteNav({
  position = "static",
  items = sourceNavItems,
  announcement = "Try our Logit Lens interface at",
  announcementLinkLabel = "workbench.ndif.us",
  announcementHref = "https://workbench.ndif.us/",
  className = "",
}: SiteNavProps = {}) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 28);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      data-ploy-component="site-nav"
      data-scrolled={scrolled ? "" : undefined}
      className={`${position === "sticky" ? "sticky -top-8" : "relative"} z-40 w-full ${className}`}
    >
      <NavbarSkipLink />
      <div className="relative flex h-8 items-center justify-center overflow-hidden bg-ploy-background-inverse px-4 font-body text-ploy-text-inverse-secondary">
        <p className="flex min-w-0 items-center gap-2 truncate text-[12.5px] leading-4 tracking-[0.005em]">
          <span className="truncate">
            {announcement}
            {announcement && announcementLinkLabel ? " " : ""}
            <a
              href={announcementHref}
              className={`${navFocus} rounded-[3px] font-medium text-ploy-text-inverse underline decoration-white/30 underline-offset-[3px] transition-[text-decoration-color] duration-150 hover:decoration-white`}
            >
              {announcementLinkLabel}
            </a>
            {announcementLinkLabel ? (
              <span aria-hidden="true" className="ml-1 text-ploy-text-inverse">
                →
              </span>
            ) : null}
          </span>
        </p>
      </div>
      <header
        className={`relative w-full border-b text-ploy-text-primary transition-[background-color,border-color,box-shadow] duration-200 ease-out ${
          scrolled
            ? "border-ploy-border-primary bg-ploy-background-primary/80 shadow-[0_1px_12px_-6px_rgb(14_14_20/0.08)] backdrop-blur-md backdrop-saturate-150"
            : "border-transparent bg-ploy-background-primary"
        }`}
      >
        <div className="mx-auto flex h-14 w-full max-w-[1280px] items-center gap-1 px-4 min-[960px]:h-[60px] min-[960px]:px-6">
          <SiteNavMobile items={items} />
          <a
            href={siteNavLinks.home}
            aria-label="NNsight home"
            className={`${navFocus} mr-2 flex shrink-0 items-center rounded-[6px] p-1 transition-opacity duration-150 hover:opacity-80 min-[1220px]:-ml-1 min-[1220px]:mr-4`}
          >
            <Logo width={43} height={26} alt="" className="block h-[26px] w-[43px]" />
          </a>
          <nav
            aria-label="Primary navigation"
            className="hidden shrink-0 items-center gap-0.5 min-[1220px]:flex"
          >
            <SiteNavDestinations items={items} />
          </nav>
          <div className="min-w-0 flex-1" />
          <SiteNavThemeToggle />
          <div className="hidden w-[200px] shrink min-w-[150px] min-[960px]:block">
            <SiteNavSearch />
          </div>
          <SiteNavSearchDialog />
          <div className="ml-0.5 max-[359px]:hidden min-[960px]:ml-2">
            <SiteNavCommunity />
          </div>
          <span
            aria-hidden="true"
            className="mx-1.5 hidden h-5 w-px bg-ploy-border-primary min-[960px]:block"
          />
          <SiteNavRepository />
          <SiteNavStatus className="ml-1.5 min-[960px]:ml-2" />
        </div>
      </header>
    </div>
  );
}
