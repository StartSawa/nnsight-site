import type { SelectHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { fieldVariants } from "./field-variants";

// A NATIVE <select>, not a listbox built out of divs.
//
// Native keeps the keyboard behaviour, the mobile wheel picker and the
// accessibility for free; the only thing it costs is the arrow, which cannot be
// styled, so the browser's is hidden with appearance-none and this one is drawn
// over it. That is why the wrapper is relative and the right padding is larger
// than the table's — the text has to clear the glyph.
//
// The trade is real: a native select cannot render rich options, groups with
// custom markup, icons, or a search field, and its open list is drawn by the OS
// rather than by this stylesheet. If the design calls for any of that, add the
// Radix-backed one alongside this rather than reinventing it:
// https://ui.shadcn.com/docs/components/radix/select
/** The select's own chevron. One glyph does not justify a dependency. */
function SelectChevron() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      className="pointer-events-none absolute right-[16px] top-1/2 h-4 w-4 -translate-y-1/2"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

/**
 * @ployComponent
 * @ployComponentId select
 * @ployComponentType component
 * @ployComponentTags form, field, measured
 * @ployComponentDescription The measured select. A native <select> with the chevron drawn over it, so keyboard and mobile behavior stay native.
 * @ployComponentStatus stable
 */
export function Select({
  className = "",
  surface = "default",
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement> &
  Pick<VariantProps<typeof fieldVariants>, "surface">) {
  return (
    <div
      className={cn(
        "relative w-full",
        surface === "light" && "text-ploy-neutral-dark",
        surface === "dark" && "text-ploy-neutral-light",
      )}
    >
      <select
        data-ploy-component="select"
        className={cn(
          fieldVariants({ kind: "fixed", surface }),
          "appearance-none pr-[48px]",
          className,
        )}
        {...props}
      >
        {children}
      </select>
      <SelectChevron />
    </div>
  );
}
