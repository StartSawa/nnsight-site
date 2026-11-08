import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { AnchorHTMLAttributes } from "react";

const linkVariants = cva("cursor-pointer", {
  variants: {
    variant: {
      // No size, leading or family: an inline link inherits them from whatever
      // it sits inside, so a linked word in a headline stays headline-sized.
      inline: "underline-offset-2",
      standalone: "text-[1.0625rem] font-medium inline-flex items-center gap-1.5",
    },
    // Unlike a heading, a link's color is part of what marks it as a link.
    // The inherit tone is for cases where the surface owns it: a link inside
    // a nav, a footer column, or any inverse section.
    //
    // The hover COLOR belongs to the accent tone, not to the base. In the
    // base it fired on tone='inherit' too, so a white footer link hovered to
    // the brand color and vanished into a brand-colored footer. What inherit
    // keeps is any surface-agnostic hover the source measured — a dim reads
    // the same on every background, a color does not.
    //
    // The underline belongs to the accent tone too: a body-coloured link
    // gets one (KRBY101), but on inherit it underlined every footer link.
    tone: {
      accent: "text-ploy-accent-primary no-underline",
      inherit: "text-inherit no-underline",
    },
  },
  defaultVariants: { variant: "inline", tone: "accent" },
});

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> &
  VariantProps<typeof linkVariants> & {
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
 * @ployComponentId link
 * @ployComponentType component
 * @ployComponentTags navigation, inline, measured-states
 * @ployComponentDescription Measured link treatment; the source declares no hover change, so none is applied. tone='inherit' hands color back to the surface.
 * @ployComponentStatus stable
 */
export function Link({
  variant = "inline",
  tone = "accent",
  className = "",
  asChild = false,
  ...props
}: LinkProps) {
  // `asChild` merges these classes and props into the element you pass
  // instead of rendering our own — the Radix convention, and what a caller
  // reaches for when wrapping a framework Link or an existing element.
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      data-ploy-component="link"
      className={cn(linkVariants({ variant, tone }), className)}
      {...props}
    />
  );
}
