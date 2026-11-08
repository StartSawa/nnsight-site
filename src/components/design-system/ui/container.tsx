import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

// Every section places its content through this — the navigation and the footer
// included. Nothing else sets a width, and nothing runs edge to edge except
// `width="full"`.
//
// Content caps are ordered narrow <= standard <= wide. All variants shrink to
// fit their parent; these caps never impose a CSS minimum width.
const containerVariants = cva("mx-auto w-full px-[20px] md:px-[32px]", {
  variants: {
    width: {
      narrow: "max-w-[680px] md:max-w-[704px]",
      standard: "max-w-[1260px] md:max-w-[1284px]",
      wide: "max-w-[1640px] md:max-w-[1664px]",
      full: "max-w-none",
    },
  },
  defaultVariants: { width: "standard" },
});

type ContainerProps = HTMLAttributes<HTMLDivElement> &
  VariantProps<typeof containerVariants> & {
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
 * @ployComponentId container
 * @ployComponentType component
 * @ployComponentTags layout, gutters, responsive
 * @ployComponentDescription content narrow 640px · standard 1342px · wide 1600px · full bleed. Measured gutters, never zero.
 * @ployComponentStatus stable
 */
export function Container({
  width = "standard",
  className = "",
  asChild = false,
  ...props
}: ContainerProps) {
  const Comp = asChild ? Slot : "div";
  return (
    <Comp
      data-ploy-component="container"
      className={cn(containerVariants({ width }), className)}
      {...props}
    />
  );
}
