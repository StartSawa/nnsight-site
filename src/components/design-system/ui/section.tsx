import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// VERTICAL RHYTHM ONLY. It sets no surface, no width and no layout — those stay
// the section's own decisions, so a band can be dark, or full-bleed, or a grid,
// without fighting a wrapper that already made the call. Content still goes
// through Container inside it.
//
// The rhythm is the page's DOMINANT one, not whatever a single band measured:
// bands often report 0 because their padding sits on inner content, so the gap
// between bands is what was read.
const sectionVariants = cva("w-full", {
  variants: {
    space: {
      default: "py-[58px] md:py-[96px]",
      condensed: "py-[29px] md:py-[48px]",
      flushTop: "pb-[58px] md:pb-[96px]",
      flushBottom: "pt-[58px] md:pt-[96px]",
      flush: "py-0",
    },
  },
  defaultVariants: { space: "default" },
});

type SectionProps = HTMLAttributes<HTMLElement> &
  VariantProps<typeof sectionVariants> & {
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
 * @ployComponentId section
 * @ployComponentType component
 * @ployComponentTags layout, rhythm, responsive
 * @ployComponentDescription Measured vertical rhythm: 58px mobile, 96px desktop, with condensed and flush variants. Surface, width and layout stay the section's own. Recommended for a band, not required. className overrides the rhythm — a band that differs takes py-3 lg:py-10, a footer measuring no bottom padding takes pb-0.
 * @ployComponentStatus stable
 */
export function Section({
  space = "default",
  className = "",
  asChild = false,
  ...props
}: SectionProps) {
  // `asChild` merges these classes and props into the element you pass
  // instead of rendering our own — the Radix convention, and what a caller
  // reaches for when wrapping a framework Link or an existing element.
  const Comp = asChild ? Slot : "section";
  return (
    <Comp
      data-ploy-component="section"
      className={cn(sectionVariants({ space }), className)}
      {...props}
    />
  );
}
