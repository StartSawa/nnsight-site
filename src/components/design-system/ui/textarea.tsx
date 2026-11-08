import type { TextareaHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { fieldVariants } from "./field-variants";

// The same table as Input, at kind="grown": vertical padding and a min-height
// instead of the fixed control height, and a radius capped tighter still — a
// pill corner that reads correctly on a short input eats the first line of a
// multi-line field.
/**
 * @ployComponent
 * @ployComponentId textarea
 * @ployComponentType component
 * @ployComponentTags form, field, measured
 * @ployComponentDescription The measured multi-line field. Grows instead of taking the fixed control height.
 * @ployComponentStatus stable
 */
export function Textarea({
  className = "",
  surface = "default",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> &
  Pick<VariantProps<typeof fieldVariants>, "surface">) {
  return (
    <textarea
      data-ploy-component="textarea"
      className={cn(fieldVariants({ kind: "grown", surface }), className)}
      {...props}
    />
  );
}
