"use client";

import * as Accordion from "@radix-ui/react-accordion";
import * as NavigationMenu from "@radix-ui/react-navigation-menu";
import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import {
  useEffect,
  useState,
  type ComponentPropsWithoutRef,
  type ReactNode,
} from "react";

import { cn } from "@/lib/utils";

import { Card } from "./card";
import { Text } from "./text";

/** Unstyled interaction parts for sections that own their navigation shell. */
export const NavbarParts = NavigationMenu;
export const NavbarAccordion = Accordion;
export const NavbarDialog = Dialog;

/**
 * @ployComponent
 * @ployComponentId navbar-skip-link
 * @ployComponentType component
 * @ployComponentTags navigation, accessibility
 * @ployComponentDescription First focusable item in a site header. Pages provide <main id="main-content" tabIndex={-1}>; targetId can select another main landmark.
 * @ployComponentStatus stable
 */
export function NavbarSkipLink({
  targetId = "main-content",
  className,
  ...props
}: Omit<ComponentPropsWithoutRef<"a">, "href"> & { targetId?: string } = {}) {
  return (
    <a
      {...props}
      href={"#" + targetId}
      data-ploy-component="navbar-skip-link"
      className={cn(
        "sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:rounded-md focus:bg-ploy-background-primary focus:px-4 focus:py-3 focus:text-ploy-text-primary focus:outline focus:outline-2 focus:outline-offset-2",
        className,
      )}
    >
      Skip to main content
    </a>
  );
}

/** The row's chevron. It rotates, which a font icon fights. */
function Chevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="h-3.5 w-3.5 shrink-0 transition-transform duration-[250ms] group-data-[state=open]/trigger:rotate-180"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/**
 * One treatment for a nav link and a dropdown trigger both, so a menu label
 * cannot end up a different size from the plain link beside it.
 */
export const navItemVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap no-underline bg-transparent border-0 cursor-pointer transition-colors duration-[250ms] text-lg font-medium font-body text-ploy-text-primary hover:text-ploy-text-primary focus-visible:outline-none focus-visible:underline",
);

export type NavItemVariants = VariantProps<typeof navItemVariants>;

/**
 * How the bar sits on the page. A variant, like every other primitive's axis —
 * the measurement picks the default, and a call site names the other one.
 */
const navbarVariants = cva("w-full bg-ploy-background-primary", {
  variants: {
    position: {
      sticky: "sticky top-0 z-50",
      fixed: "fixed inset-x-0 top-0 z-50",
      absolute: "absolute inset-x-0 top-0 z-50",
      static: "relative",
    },
  },
  defaultVariants: { position: "sticky" },
});

/**
 * @ployComponent
 * @ployComponentId navbar
 * @ployComponentType component
 * @ployComponentTags navigation, header, dropdown, measured
 * @ployComponentDescription The measured bar. Radix NavigationMenu owns the open state, so one dropdown is open at a time and clicking the page closes it.
 * @ployComponentStatus stable
 */
export function Navbar({
  brand,
  brandFlush = false,
  children,
  actions,
  mobile,
  position,
  className = "",
  ...props
}: {
  /** The wordmark. It never shrinks — see the flex-none below. */
  brand: ReactNode;
  /**
   * Pull the mark left by the bar's own gutter at desktop, so it lines up with
   * the page content rather than sitting a gutter further in.
   *
   * Off by default and deliberately not measured. Whether a bar reads better
   * flush depends on the mark's own bearing, which no probe can see: a wordmark
   * with built-in whitespace already looks flush and moves too far, and on one
   * source it simply looked wrong. A tenant turns it on when it helps.
   */
  brandFlush?: boolean;
  /** NavbarLink and NavbarMenu items. */
  children: ReactNode;
  /** CTAs on the right of the bar. */
  actions?: ReactNode;
  /** Contents of the mobile panel. Omit for a bar with no mobile menu. */
  mobile?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"header">, "className"> &
  VariantProps<typeof navbarVariants>) {
  const [open, setOpen] = useState(false);

  // Lock the page behind an open sheet. A full-screen menu over a document that
  // still scrolls is the defect every hand-rolled one ships with: the menu
  // stays put and the page slides around underneath it.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("keydown", closeOnEscape);
      document.body.style.overflow = previous;
    };
  }, [open]);
  return (
    <header
      className={cn(navbarVariants({ position }), className)}
      {...props}
      // AFTER the spread, deliberately. A section that sets its own
      // `data-ploy-component` overwrote this one, and the marker is how a gate
      // — and the guide's own layout — finds the bar: with it gone, a fixed bar
      // could not be pinned back into flow and the DOM checks looked past it.
      data-ploy-component="navbar"
    >
      <NavbarSkipLink />
      {/* The bar switches height at lg, the SAME breakpoint the sheet
          hides at. Switching at md while the sheet hid at lg left a band
          between them where the bar stood 72px tall and its full-screen
          panel still started at 60px — so the panel's box ran 12px past
          the viewport and scrolled for no reason. One breakpoint decides
          whether this is the mobile bar. */}
      {/* Root wraps the WHOLE bar, not just the link row.
          <NavbarLink> renders a NavigationMenu.Item, and Radix throws
          "FocusGroupItem must be used within NavigationMenu" for one rendered
          outside a Root — so a Login link in the actions slot, which is where
          a Login link belongs, crashed the page during server render. Every slot is a
          legal place to use one now. */}
      <NavigationMenu.Root
        // One open value for the whole bar. Two rows cannot both be open, and
        // Radix closes this on outside pointerdown, Escape, and focus out.
        //
        // 150ms of hover intent: not measured, because a computed style cannot
        // report it, and Radix's own default — so a pointer crossing the row
        // does not flash every panel on the way past.
        delayDuration={150}
        className="w-full"
      >
        {/* The NAV'S OWN width and gutter, not the section container's. A bar is
          full-bleed and its content routinely runs wider than the body — this
          source measures 1318px against a
          standard section — and borrowing the
          section width pulls the whole bar inward. */}
        <div className="relative mx-auto flex h-[53px] lg:h-[53px] w-full max-w-[1318px] items-center justify-between gap-6 px-[20px] md:px-[24px]">
          {/* flex-none: a brand mark that shrinks with the row is the defect that
            squashed a wordmark to an ellipse at tablet width. */}
          <div className={cn("flex-none", brandFlush && "lg:-ml-[24px]")}>
            {brand}
          </div>

          {/* No NavigationMenu.Viewport. A single shared viewport is the shadcn
            default, and it renders every panel in ONE box centred under the
            bar — so the Facilities menu opens under Clinicians and the whole
            thing reads as broken. Each Item positions its own Content instead,
            which is what a real marketing nav does. */}
          {/* The growth sits on a wrapper WE own, not on the List.
            Radix renders its own div around the ul, and that div is the actual
            flex child of this row — so `flex-1` on the List reached an element
            two levels in and the wrapper stayed flex-grow:0. With three
            non-growing children, justify-between then spread them evenly and
            the links landed dead centre on a bar measured as logo-left. That is
            the arrangement defect this component exists to prevent, arriving
            through the one element the class could not reach. */}
          <div className="hidden min-w-0 flex-1 lg:block [&>div]:!static">
            <NavigationMenu.List className="flex w-full list-none items-center gap-[16px] p-0 m-0 justify-start">
              {children}
            </NavigationMenu.List>
          </div>

          <div data-nav-actions className="flex flex-none items-center gap-3">
            {actions}
            {mobile ? (
              <button
                type="button"
                data-mobile-menu-trigger
                aria-expanded={open}
                aria-label={open ? "Close menu" : "Open menu"}
                onClick={() => setOpen(!open)}
                // The bar's own text colour. The glyph is stroked in
                // currentColor, and with nothing setting it the button inherited
                // text-primary from body — a dark navy mark on a dark navy bar,
                // so one source's phone menu had no visible way in at all.
                className="lg:hidden inline-flex h-10 w-10 items-center justify-center cursor-pointer text-ploy-text-primary"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                >
                  {open ? (
                    <path d="M6 6l12 12M18 6L6 18" />
                  ) : (
                    <path d="M4 7h16M4 12h16M4 17h16" />
                  )}
                </svg>
              </button>
            ) : null}
          </div>
        </div>

        {mobile && open ? (
          <div
            data-mobile-menu
            onClick={(event) => {
              if (
                event.target instanceof Element &&
                event.target.closest("a[href]")
              )
                setOpen(false);
            }}
            className="fixed inset-0 top-[53px] z-40 overflow-y-auto overscroll-contain lg:hidden bg-ploy-background-primary px-[24px] py-6"
          >
            {mobile}
          </div>
        ) : null}
      </NavigationMenu.Root>
    </header>
  );
}

/**
 * @ployComponent
 * @ployComponentId navbar-link
 * @ployComponentType component
 * @ployComponentTags navigation, header
 * @ployComponentDescription A plain nav link — no dropdown. Same treatment as a menu trigger.
 * @ployComponentStatus stable
 */
export function NavbarLink({
  href,
  children,
  className = "",
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<typeof NavigationMenu.Link>,
  "href" | "className"
>) {
  // list-none on the ITEM, not just on the List. A NavigationMenu.Item is an
  // li, and an li paints its marker from its own display:list-item regardless
  // of what encloses it — so one used in the actions slot, outside the List's
  // ul, showed a bullet beside "Login".
  return (
    <NavigationMenu.Item className="list-none">
      <NavigationMenu.Link
        href={href}
        data-ploy-component="navbar-link"
        className={cn(navItemVariants(), className)}
        {...props}
      >
        {children}
      </NavigationMenu.Link>
    </NavigationMenu.Item>
  );
}

const menuVariants = cva("group/menu list-none", {
  variants: { layout: { list: "relative", mega: "static" } },
  defaultVariants: { layout: "list" },
});

/**
 * @ployComponent
 * @ployComponentId navbar-menu
 * @ployComponentType component
 * @ployComponentTags navigation, header, dropdown
 * @ployComponentDescription A nav item that opens a panel. Pass the sub-navigation as children; NavbarMenuLink renders one row of it.
 * @ployComponentStatus stable
 */
export function NavbarMenu({
  label,
  layout = "list",
  panelClassName,
  children,
  className = "",
  ...props
}: {
  label: string;
  /** A list under its trigger, or a column grid across the bar. */
  layout?: "list" | "mega";
  panelClassName?: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"button">, "className">) {
  // relative: the panel positions against THIS item, so it opens under its own
  // trigger rather than under the middle of the bar.
  return (
    <NavigationMenu.Item
      data-layout={layout}
      className={menuVariants({ layout })}
    >
      <NavigationMenu.Trigger
        data-ploy-component="navbar-menu"
        className={cn("group/trigger", navItemVariants(), className)}
        {...props}
      >
        {label}
      </NavigationMenu.Trigger>
      {/* The panel IS a Card at overlay depth — same radius, same surface, the
          page's own measured shadow. A dropdown that paints itself is a
          dropdown that can disagree with every card beside it. */}
      {/* Radix positions NavigationMenu.Content itself and does NOT use
          floating-ui for it — Popover, DropdownMenu and Tooltip do, this does
          not. So a panel pinned left-0 under a trigger near the right edge runs
          straight off the page: one source's Login and Sign up menus opened
          past the viewport.

          Anchored by SLOT, not by measurement. A menu in the actions cluster is
          hard against the right edge by construction, so it opens bottom-right;
          one in the links list opens bottom-left. The measured version this
          replaces could never fire — Radix unmounts closed Content, so the ref
          was null on mount and the observer attached to nothing. */}
      <NavigationMenu.Content className="absolute top-full z-50 pt-2 left-0 group-data-[layout=mega]/menu:right-0 [[data-nav-actions]_&]:left-auto [[data-nav-actions]_&]:right-0 data-[state=closed]:animate-faq-up data-[state=open]:animate-faq-down">
        <Card
          elevation="overlay"
          padding="compact"
          className={cn("min-w-[220px]", panelClassName)}
        >
          <ul className="m-0 flex list-none flex-col gap-1 p-0 group-data-[layout=mega]/menu:grid group-data-[layout=mega]/menu:grid-cols-3">
            {children}
          </ul>
        </Card>
      </NavigationMenu.Content>
    </NavigationMenu.Item>
  );
}

/**
 * @ployComponent
 * @ployComponentId navbar-menu-link
 * @ployComponentType component
 * @ployComponentTags navigation, header, dropdown
 * @ployComponentDescription One row inside a dropdown panel.
 * @ployComponentStatus stable
 */
export function NavbarMenuLink({
  href,
  children,
  description,
  className = "",
  ...props
}: {
  href: string;
  children: ReactNode;
  /** Optional second line, for a nav that describes its destinations. */
  description?: string;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<typeof NavigationMenu.Link>,
  "href" | "className"
>) {
  return (
    <li>
      <NavigationMenu.Link
        href={href}
        data-ploy-component="navbar-menu-link"
        className={cn(
          "block whitespace-nowrap rounded-[4px] px-3 py-2 no-underline text-lg font-body text-ploy-text-primary transition-colors duration-[250ms] hover:bg-ploy-background-secondary hover:text-ploy-text-primary",
          className,
        )}
        {...props}
      >
        {children}
        {/* A span, not the default p: this sits inside an anchor, and a
            paragraph nested in one is invalid HTML that hydrates with a
            warning. */}
        {description ? (
          <Text as="span" variant="small" className="block">
            {description}
          </Text>
        ) : null}
      </NavigationMenu.Link>
    </li>
  );
}

/**
 * @ployComponent
 * @ployComponentId navbar-mobile-nav
 * @ployComponentType component
 * @ployComponentTags navigation, header, mobile, measured
 * @ployComponentDescription The mobile panel's list. Wrap the sheet's contents in this so a group can open.
 * @ployComponentStatus stable
 */
export function NavbarMobileNav({
  children,
  className = "",
  defaultValue,
  size = "nav",
  bordered = true,
  ...props
}: {
  children: ReactNode;
  className?: string;
  /**
   * The panel's type. A phone menu is often set far larger than the bar it
   * replaces — `heading` is this page's own h3. Set it on the PANEL so a
   * group row and a plain row cannot end up different sizes.
   */
  size?: "nav" | "heading";
  /** A rule under every row. Off, the rows space themselves symmetrically. */
  bordered?: boolean;
  /** Open one group on load. Radix keys groups by string, never by number. */
  defaultValue?: string;
  // Plain div props, NOT Accordion.Root's: its props are a union of the single
  // and multiple forms, so an Omit over them widens `value` to
  // `string | string[]`, which no longer assigns to the single form this
  // renders. The four dropped below are the ones where a div and this Root
  // disagree about the type of the SAME prop name.
} & Omit<
  ComponentPropsWithoutRef<"div">,
  "className" | "children" | "value" | "defaultValue" | "dir" | "onChange"
>) {
  return (
    <Accordion.Root
      // One open at a time, and collapsible so the open one can be closed
      // again — the same contract the desktop bar has, where Radix
      // NavigationMenu holds a single open value.
      type="single"
      collapsible
      defaultValue={defaultValue}
      data-ploy-component="navbar-mobile-nav"
      data-size={size}
      data-bordered={bordered ? "" : undefined}
      className={cn("group/mobilenav flex flex-col", className)}
      {...props}
    >
      {children}
    </Accordion.Root>
  );
}

/**
 * @ployComponent
 * @ployComponentId navbar-mobile-group
 * @ployComponentType component
 * @ployComponentTags navigation, header, mobile, disclosure, measured
 * @ployComponentDescription A subnav on a phone: the label opens to reveal its links. Every desktop NavbarMenu needs one of these, or its links are unreachable on mobile.
 * @ployComponentStatus stable
 */
export function NavbarMobileGroup({
  label,
  children,
  value,
  className = "",
  ...props
}: {
  label: string;
  children: ReactNode;
  /** Optional: defaults to the label. Radix needs one stable id per row. */
  value?: string;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"div">, "className" | "value">) {
  return (
    <Accordion.Item
      value={value ?? label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}
      data-ploy-component="navbar-mobile-group"
      className={cn(
        // The rule is the PANEL's decision. Without one, the row keeps its own
        // vertical padding so the spacing stays even with the plain rows
        // beside it — a bordered row and a bare row must not sit differently.
        "group-data-[bordered]/mobilenav:border-b group-data-[bordered]/mobilenav:border-ploy-border-primary",
        className,
      )}
      {...props}
    >
      <Accordion.Header>
        <Accordion.Trigger className="group/trigger flex w-full cursor-pointer items-center justify-between gap-4 py-3 text-left text-lg font-medium font-body text-ploy-text-primary hover:text-ploy-text-primary transition-colors duration-[250ms] group-data-[size=heading]/mobilenav:text-[2rem]">
          {label}
          <Chevron />
        </Accordion.Trigger>
      </Accordion.Header>
      {/* Radix publishes the measured content height as a CSS variable, which
          is what makes an `auto` height animatable at all. The keyframes are
          the accordion's, already in globals.css. */}
      <Accordion.Content className="overflow-hidden data-[state=closed]:animate-faq-up data-[state=open]:animate-faq-down">
        <div className="flex flex-col pb-3">{children}</div>
      </Accordion.Content>
    </Accordion.Item>
  );
}

/**
 * @ployComponent
 * @ployComponentId navbar-mobile-link
 * @ployComponentType component
 * @ployComponentTags navigation, header, mobile, measured
 * @ployComponentDescription One row in the mobile panel — a top-level destination, or a link inside a group.
 * @ployComponentStatus stable
 */
export function NavbarMobileLink({
  href,
  children,
  className = "",
  ...props
}: {
  href: string;
  children: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<"a">, "href" | "className">) {
  return (
    <a
      href={href}
      data-ploy-component="navbar-mobile-link"
      className={cn(
        "block py-3 no-underline text-lg font-medium font-body text-ploy-text-primary hover:text-ploy-text-primary transition-colors duration-[250ms]",
        "group-data-[size=heading]/mobilenav:text-[2rem]",
        className,
      )}
      {...props}
    >
      {children}
    </a>
  );
}
