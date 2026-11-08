import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// The complete visual scale. Semantic tags remain a call-site decision.
const headingVariants = cva("text-balance", {
  variants: {
    level: {
      1: "font-heading font-semibold text-[2.375rem] leading-[1.04] tracking-[-0.035em] md:text-[3.5rem] md:leading-[1.02] md:tracking-[-0.04em]",
      2: "font-heading font-semibold text-[1.875rem] leading-[1.08] tracking-[-0.03em] md:text-[2.5rem] md:leading-[1.05] md:tracking-[-0.035em]",
      3: "font-heading font-semibold text-[1.4375rem] leading-[1.15] tracking-[-0.02em] md:text-[1.75rem] md:leading-[1.12] md:tracking-[-0.025em]",
      4: "font-heading font-semibold text-[1.25rem] leading-[1.25] tracking-[-0.015em] md:text-[1.3125rem] md:leading-[1.25] md:tracking-[-0.02em]",
      5: "font-heading font-semibold text-[1.0625rem] leading-[1.3] tracking-[-0.01em] md:text-[1.125rem] md:leading-[1.3] md:tracking-[-0.01em]",
      6: "font-heading font-semibold text-base leading-[1.35] tracking-normal md:text-[1.0625rem] md:leading-[1.35] md:tracking-normal",
    },
  },
  defaultVariants: { level: 2 },
});

type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span";

type HeadingProps = HTMLAttributes<HTMLHeadingElement> &
  VariantProps<typeof headingVariants> & {
    /** The semantic tag. The document outline and the visual level are separate decisions. */
    as?: HeadingTag;
    /** Merge these classes into an element you already have, instead of rendering our own. */
    asChild?: boolean;
  };

/**
 * @ployComponent
 * @ployComponentId heading
 * @ployComponentType component
 * @ployComponentTags typography, scale, responsive
 * @ployComponentDescription The measured heading scale, levels 1-6, responsive at md.
 * @ployComponentStatus stable
 */
export function Heading({
  level = 2,
  as,
  className = "",
  asChild = false,
  ...props
}: HeadingProps) {
  const Tag = asChild ? Slot : ((as ?? "h2") as HeadingTag);
  return (
    <Tag
      data-ploy-component="heading"
      className={cn(headingVariants({ level }), className)}
      {...props}
    />
  );
}
