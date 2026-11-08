"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

/**
 * @ployComponent
 * @ployComponentId checkbox
 * @ployComponentType component
 * @ployComponentTags form, control, checkbox, measured
 * @ployComponentDescription The measured checkbox. Radix handles the space key, the indeterminate state and the hidden input a form submits.
 * @ployComponentStatus stable
 */
export function Checkbox({
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>) {
  return (
    <CheckboxPrimitive.Root
      data-ploy-component="checkbox"
      // Geometry is the control table's, so a checkbox and the input beside it
      // cannot disagree about border width. The checked colours are the theme's,
      // checked there against the page.
      className={cn(
        "peer shrink-0 inline-flex items-center justify-center cursor-pointer",
        "size-[17px] border-[1px] border-ploy-input-border bg-ploy-input-background",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 outline-ploy-accent-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-[color:var(--ploy-choice-checked-background,var(--ploy-text-primary))] data-[state=checked]:border-[color:var(--ploy-choice-checked-border,var(--ploy-text-primary))]",
        "data-[state=checked]:text-[color:var(--ploy-choice-checked-mark,var(--ploy-background-primary))]",
        "rounded-[5px]",
        className,
      )}
      {...props}
    >
      {/* Radix renders the indicator only while checked, so the glyph needs no
          state of its own. It paints in currentColor, which the checked text
          token sets — one token decides the tick and the label together. */}
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-[12px]"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3.5 8.5l3 3 6-7" />
        </svg>
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}
