import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import type { ElementType, HTMLAttributes } from "react";

const textVariants = cva("", {
  variants: {
    variant: {
      body: "font-body text-[1rem] leading-[1.65] tracking-normal md:text-[1.0625rem] md:leading-[1.65] md:tracking-normal",
      lead: "font-body text-[1.0625rem] leading-[1.55] tracking-[-0.005em] md:text-[1.1875rem] md:leading-[1.55]",
      small: "font-body text-sm leading-[1.5] tracking-normal",
    },
  },
  defaultVariants: { variant: "body" },
});

// Paragraph props, plus `as`, matching Button and Card. A closed
// `"p" | "span" | "div"` union looked safe and was not: body copy legitimately
// renders as a `li`, a `dd`, a `figcaption`, or a `span` inside an anchor —
// and a `p` nested in an `a` is invalid HTML that hydrates with a warning. The
// generic `<T extends ElementType>` form reads better and does not compile: JSX
// resolves the tag's props through T and plain `data-*` attributes stop being
// assignable.
type TextProps = HTMLAttributes<HTMLParagraphElement> &
  VariantProps<typeof textVariants> & {
    /** `p` by default. Any element — a caption, a list item, an inline span. */
    as?: ElementType;
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
 * @ployComponentId text
 * @ployComponentType component
 * @ployComponentTags typography, body-copy
 * @ployComponentDescription The measured body-copy styles. Color is inherited from the section; alignment and weight are call-site utilities.
 * @ployComponentStatus stable
 */
export function Text({
  variant = "body",
  as = "p",
  className = "",
  asChild = false,
  ...props
}: TextProps) {
  // `asChild` merges this component's classes and props into the element you
  // pass instead of rendering its own — the Radix convention, and the one a
  // caller reaches for when wrapping a framework Link or an existing anchor.
  // Without it, wrapping an <a> in a component that renders an <a> nests them,
  // which is invalid HTML and fails hydration.
  const Tag = asChild ? Slot : (as as ElementType);
  return (
    <Tag
      data-ploy-component="text"
      className={cn(textVariants({ variant }), className)}
      {...props}
    />
  );
}
