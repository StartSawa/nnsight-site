import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// It carries NO margin, deliberately. Space it at the call site — a rule with
// built-in spacing cannot sit flush, and every place that wants it flush would
// have to cancel the margin back off.
const separatorVariants = cva("shrink-0 border-0", {
  variants: {
    orientation: {
      horizontal: "h-[1px] w-full",
      vertical: "w-[1px] h-full self-stretch",
    },
    tone: {
      default: "bg-ploy-border-primary",
      inverse: "bg-ploy-border-primary",
    },
  },
  defaultVariants: { orientation: "horizontal", tone: "default" },
});

type SeparatorProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof separatorVariants> & {
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
 * @ployComponentId separator
 * @ployComponentType component
 * @ployComponentTags divider, rule, measured
 * @ployComponentDescription The measured rule between blocks. Carries no margin — space it at the call site.
 * @ployComponentStatus stable
 */
export function Separator({
  orientation = "horizontal",
  tone = "default",
  className = "",
  asChild = false,
  ...props
}: SeparatorProps) {
  // `asChild` merges these classes and props into the element you pass
  // instead of rendering our own — the Radix convention, and what a caller
  // reaches for when wrapping a framework Link or an existing element.
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      role="separator"
      aria-orientation={orientation ?? "horizontal"}
      data-ploy-component="separator"
      className={cn(separatorVariants({ orientation, tone }), className)}
      {...props}
    />
  );
}
