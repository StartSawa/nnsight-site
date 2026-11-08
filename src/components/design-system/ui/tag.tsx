import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

const tagVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap min-h-[24px] rounded-[8px] px-[8px] py-[4px] text-xs font-medium",
  {
    variants: {
      // Tints, not new colours: each is a scale step of a token the theme already
      // generated, so a pill cannot introduce a hue the brand does not have.
      tone: {
        // Both ends from the same scale, like the accent tone beside it. Pairing
        // a scale STEP with a THEME token breaks on a dark site: 100 is a light
        // step whatever the theme, while the page text token follows the page and
        // turns white -- so a status tag rendered white on a near-white pill and
        // could not be read at all.
        neutral: "bg-ploy-neutral-primary-100 text-ploy-neutral-primary-900",
        accent: "bg-ploy-accent-primary-100 text-ploy-accent-primary-700",
        secondary:
          "bg-ploy-accent-secondary-100 text-ploy-accent-secondary-700",
        solid: "bg-ploy-accent-primary text-ploy-text-on-accent-primary",
        outline:
          "bg-transparent text-ploy-text-primary border border-ploy-border-primary",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

type TagProps = HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof tagVariants> & {
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
 * @ployComponentId tag
 * @ployComponentType component
 * @ployComponentTags badge, chip, label, measured
 * @ployComponentDescription The measured pill. Tones are tints of existing tokens, never new hues.
 * @ployComponentStatus stable
 */
export function Tag({
  tone = "neutral",
  className = "",
  asChild = false,
  ...props
}: TagProps) {
  const Comp = asChild ? Slot : "span";
  return (
    <Comp
      data-ploy-component="tag"
      className={cn(tagVariants({ tone }), className)}
      {...props}
    />
  );
}
