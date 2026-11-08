import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// The complete visual scale. Semantic tags remain a call-site decision.
const displayHeadingVariants = cva("text-balance", {
  variants: {
    size: {
      1: "font-heading font-semibold text-[2.75rem] leading-[1] tracking-[-0.045em] md:text-[4.75rem] md:leading-[0.98] md:tracking-[-0.05em]",
      2: "font-heading font-semibold text-[2.375rem] leading-[1.02] tracking-[-0.04em] md:text-[3.5rem] xl:text-[3.75rem] md:leading-[1] md:tracking-[-0.045em]",
    },
  },
  defaultVariants: { size: 1 },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

type DisplayHeadingProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof displayHeadingVariants> & {
    /** The semantic tag. The document outline and the visual level are separate decisions. */
    as?: HeadingTag;
    /** Merge these classes into an element you already have, instead of rendering our own. */
    asChild?: boolean;
  };

/**
 * @ployComponent
 * @ployComponentId displayHeading
 * @ployComponentType component
 * @ployComponentTags typography, scale, responsive
 * @ployComponentDescription The measured display scale, sizes 1-2, responsive at md.
 * @ployComponentStatus stable
 */
export function DisplayHeading({
  size = 1,
  as,
  className = "",
  asChild = false,
  ...props
}: DisplayHeadingProps) {
  const Tag = asChild ? Slot : ((as ?? "h1") as HeadingTag);
  return (
    <Tag
      data-ploy-component="displayHeading"
      className={cn(displayHeadingVariants({ size }), className)}
      {...props}
    />
  );
}
