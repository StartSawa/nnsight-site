import { isValidElement } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ElementType } from "react";

const cardVariants = cva(
  [
    "block",
    "bg-ploy-background-primary",
    "text-ploy-text-primary",
    "rounded-[4px]",
  ],
  {
    variants: {
      variant: {
        default: [""],
      },
      // A surface and its text travel together: a background without its paired
      // foreground inherits the page's text colour and can vanish into the card.
      // `cn` merges last-wins, so inverse replaces the base pair.
      tone: {
        default: "",
        inverse:
          "bg-ploy-background-inverse text-ploy-text-inverse [--ploy-text-primary:var(--ploy-text-inverse)] [--ploy-text-secondary:var(--ploy-text-inverse-secondary)] [--ploy-border-primary:var(--ploy-border-inverse)]",
      },
      elevation: {
        flat: "shadow-none",
        raised: "shadow-[shadow:0px_2px_4px_0px_rgba(0,0,0,0.1)]",
        overlay:
          "shadow-[shadow:0px_4.4px_11px_0px_rgba(0,0,0,0.1),_0px_0px_1.1px_0px_rgba(0,0,0,0.25)]",
      },
      // A page mixes bordered and borderless cards, so the border is a variant and
      // the measurement only decides which one it starts on.
      bordered: {
        true: "border border-ploy-border-primary",
        false: "border-0",
      },
      padding: {
        compact: "p-[18px]",
        default: "p-[24px]",
        comfortable: "p-[36px]",
        // Image-only and full-bleed content can request no inset.
        none: "p-0",
        source: "",
      },
      linked: {
        true: [
          "motion-safe:[transition-property:box-shadow,_opacity,_transform,_translate,_scale,_filter]",
          "motion-safe:[transition-duration:200ms]",
          "focus-visible:[outline:2px_solid_var(--ploy-accent-primary)]",
          "focus-visible:outline-offset-4",
          "motion-reduce:[transform:none]",
          "motion-reduce:[translate:none]",
          "motion-reduce:[scale:none]",
        ],
        false: "",
      },
    },
    compoundVariants: [
      {
        linked: true,
        variant: "default",
        class: ["hover:opacity-[0.92]"],
      },
    ],
    defaultVariants: {
      variant: "default",
      tone: "default",
      elevation: "flat",
      bordered: false,
      padding: "default",
    },
  },
);

// Div props, plus `as`. A generic `<T extends ElementType>` reads better and
// does not compile: JSX resolves the tag's props through T, and a plain
// `data-*` attribute stops being assignable.
type CardProps = VariantProps<typeof cardVariants> &
  ComponentPropsWithoutRef<"div"> & {
    /** Link state is derived from href, as, or the slotted child. */
    linked?: never;
    /** `a` for a card that navigates, `article` or `li` inside a list. */
    as?: ElementType;
    href?: string;
    /**
     * Merge these classes and props into the element passed as children
     * instead of rendering our own. The Radix convention — reach for it when
     * wrapping a framework Link or an element that already exists, because
     * nesting one inside our own tag is invalid HTML and fails hydration.
     */
    asChild?: boolean;
  };

/**
 * @ployComponent
 * @ployComponentId card
 * @ployComponentType component
 * @ployComponentTags surface, container, measured
 * @ployComponentDescription The measured surface. raised/overlay use measured shadows or subtle defaults when none are available, so a dropdown, a popover and a modal agree with the cards around them.
 * @ployComponentStatus stable
 */
export function Card({
  as,
  href,
  variant,
  tone = "default",
  elevation = "flat",
  bordered = false,
  padding = "default",
  className = "",
  asChild = false,
  ...props
}: CardProps) {
  // `asChild` merges this component's classes and props into the element you
  // pass instead of rendering its own — the Radix convention, and the one a
  // caller reaches for when wrapping a framework Link or an existing anchor.
  // Without it, wrapping an <a> in a component that renders an <a> nests them,
  // which is invalid HTML and fails hydration.
  const linked =
    href !== undefined ||
    as === "a" ||
    (asChild &&
      isValidElement<{ href?: string }>(props.children) &&
      props.children.props.href !== undefined);
  const selected = variant ?? "default";
  const Tag = asChild
    ? Slot
    : ((as ?? (href !== undefined ? "a" : "div")) as ElementType);
  return (
    <Tag
      data-ploy-component="card"
      data-ploy-card-variant={selected}
      data-ploy-card-link={linked || undefined}
      data-ploy-card-padding={padding}
      href={href}
      className={cn(
        cardVariants({
          variant: selected,
          tone,
          elevation,
          bordered,
          padding,
          linked,
        }),
        className,
      )}
      {...props}
    />
  );
}
