import { cva, type VariantProps } from "class-variance-authority";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";
import { Children } from "react";
import type { ComponentPropsWithoutRef, ElementType } from "react";

// Keep room for one label line, padding, and borders.
const buttonSpacing = "min-h-[calc(1lh+18px)] py-2";
// Ghost has no resting surface. Hover styles and explicit caller overrides remain available.
const ghostSurface = "bg-transparent border-transparent";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap no-underline box-border border h-[42px] rounded-[4px] px-[18px] text-[0.875rem] font-semibold transition-[background-color,border-color,color,opacity,translate,scale,box-shadow] duration-[250ms] disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary:
          "bg-ploy-button-primary-background text-ploy-button-primary-text border-ploy-button-primary-border [overflow:visible] font-[600] rounded-[4px] border-[0px] [background-image:linear-gradient(180deg,rgb(255_255_255/0.2),rgb(255_255_255/0)_60%)] shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_0_0_1px_rgb(138_34_214),0_8px_22px_-6px_rgb(161_52_235/0.6),0_0_36px_-6px_rgb(161_52_235/0.45)] hover:-translate-y-px hover:bg-[#8a22d6] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_0_0_1px_rgb(138_34_214),0_12px_30px_-6px_rgb(161_52_235/0.75),0_0_48px_-4px_rgb(161_52_235/0.6)] active:translate-y-px",
        secondary:
          "bg-ploy-button-secondary-background text-ploy-button-secondary-text border-ploy-button-secondary-border [overflow:visible] font-[600] rounded-[4px] border-[1px] hover:border-ploy-text-primary active:translate-y-px",
        outline: "bg-transparent text-current border-current",
        ghost: "bg-transparent border-transparent",
      },
      // Outline inherits its foreground; explicit light/dark tones override it.
      // Its currentColor border always follows that foreground.
      tone: {
        brand: "",
        light: "",
        dark: "",
      },
      size: {
        md: "",
      },
      block: {
        true: "w-full",
        false: "",
      },
    },
    compoundVariants: [
      {
        variant: "ghost",
        tone: "brand",
        className: "text-ploy-accent-primary",
      },
      {
        variant: ["outline", "ghost"],
        tone: "light",
        className: "text-ploy-neutral-light",
      },
      {
        variant: ["outline", "ghost"],
        tone: "dark",
        className: "text-ploy-neutral-dark",
      },
    ],
    defaultVariants: {
      variant: "primary",
      tone: "brand",
      size: "md",
      block: false,
    },
  },
);

type ButtonProps = VariantProps<typeof buttonVariants> &
  ComponentPropsWithoutRef<"a"> & {
    /** Override the tag: an href selects an anchor; otherwise a button. */
    as?: ElementType;
    /** Merge into the child element. */
    asChild?: boolean;
  };

/**
 * @ployComponent
 * @ployComponentId button
 * @ployComponentType component
 * @ployComponentTags action, cta, measured
 * @ployComponentDescription Measured action with safe spacing and an 8px icon gap. Override spacing through className. Outline inherits text/border; outline and ghost accept tone=brand|light|dark. Uses <a> with href, otherwise <button>; as overrides the tag. Pass type=submit for form actions.
 * @ployComponentStatus stable
 */
export function Button({
  as,
  variant = "primary",
  tone = "brand",
  size = "md",
  block = false,
  className = "",
  asChild = false,
  ...props
}: ButtonProps) {
  const Tag = asChild
    ? Slot
    : ((as ?? ("href" in props ? "a" : "button")) as ElementType);
  // KRBY022 icon-buttons-skip-the-label-floor: icon-only controls keep their size.
  const iconOnly =
    !asChild &&
    !!props["aria-label"] &&
    !Children.toArray(props.children).some(
      (child) => typeof child === "string" || typeof child === "number",
    );
  return (
    <Tag
      data-ploy-component="button"
      className={cn(
        buttonVariants({ variant, tone, size, block }),
        !iconOnly && buttonSpacing,
        variant === "ghost" && ghostSurface,
        className,
      )}
      {...props}
    >
      {props.children}
    </Tag>
  );
}
