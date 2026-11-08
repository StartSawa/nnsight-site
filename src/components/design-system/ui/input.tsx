import type { InputHTMLAttributes } from "react";
import type { VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

import { fieldVariants } from "./field-variants";

// Height, radius, padding and border all come from field-variants.ts, which
// Textarea and Select read too — so three fields side by side cannot drift.
// Adjust the table, not this file, unless only the input should change.
/**
 * @ployComponent
 * @ployComponentId input
 * @ployComponentType component
 * @ployComponentTags form, field, measured
 * @ployComponentDescription The measured text field. Use placeholder for text inside an empty field and aria-label or an external label for its accessible name. Do not overlay a static label on entered text. If a captured floating label is required, reserve its own space and derive its position from whether the value is empty, never from validity.
 * @ployComponentStatus stable
 */
export function Input({
  className = "",
  surface = "default",
  ...props
}: InputHTMLAttributes<HTMLInputElement> &
  Pick<VariantProps<typeof fieldVariants>, "surface">) {
  return (
    <input
      data-ploy-component="input"
      data-1p-ignore
      className={cn(fieldVariants({ kind: "fixed", surface }), className)}
      {...props}
    />
  );
}
