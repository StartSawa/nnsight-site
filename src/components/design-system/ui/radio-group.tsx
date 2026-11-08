"use client";

import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

/**
 * @ployComponent
 * @ployComponentId radio-group
 * @ployComponentType component
 * @ployComponentTags form, control, radio, measured
 * @ployComponentDescription The measured radio group. Radix gives it arrow-key roving focus, which a set of styled divs does not have.
 * @ployComponentStatus stable
 */
export function RadioGroup({
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>) {
  return (
    <RadioGroupPrimitive.Root
      data-ploy-component="radio-group"
      className={cn("grid gap-3", className)}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId radio-group-item
 * @ployComponentType component
 * @ployComponentTags form, control, radio, measured
 * @ployComponentDescription One option. The checkbox's box drawn round — same border, same fill, same size.
 * @ployComponentStatus stable
 */
export function RadioGroupItem({
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>) {
  return (
    <RadioGroupPrimitive.Item
      data-ploy-component="radio-group-item"
      // Always round, whatever the brand's radius is. A square radio is not a
      // brand decision, it is a control nobody recognises.
      className={cn(
        "peer shrink-0 inline-flex items-center justify-center cursor-pointer",
        "size-[17px] border-[1px] border-ploy-input-border bg-ploy-input-background",
        "transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 outline-ploy-accent-primary",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "data-[state=checked]:bg-[color:var(--ploy-choice-checked-background,var(--ploy-text-primary))] data-[state=checked]:border-[color:var(--ploy-choice-checked-border,var(--ploy-text-primary))]",
        "data-[state=checked]:text-[color:var(--ploy-choice-checked-mark,var(--ploy-background-primary))]",
        "rounded-full",
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <span className="block size-[7px] rounded-full bg-current" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
}
