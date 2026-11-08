"use client";

import * as TabsPrimitive from "@radix-ui/react-tabs";
import { createContext, useContext } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef } from "react";

const tabsVariants = cva("flex min-w-0 flex-col gap-6", {
  variants: { variant: { default: "" } },
  defaultVariants: { variant: "default" },
});
type TabVariantName = NonNullable<VariantProps<typeof tabsVariants>["variant"]>;
const TabVariant = createContext<TabVariantName>("default");
const tabOrientations: Record<
  TabVariantName,
  { desktop: "horizontal" | "vertical"; mobile: "horizontal" | "vertical" }
> = { default: { desktop: "horizontal", mobile: "horizontal" } };
const tabListVariants = cva("", {
  variants: { variant: { default: "" } },
  defaultVariants: { variant: "default" },
});
const tabTriggerVariants = cva("", {
  variants: { variant: { default: "" } },
  defaultVariants: { variant: "default" },
});
export const tabsPreviewClasses: Record<string, string> = {};

/**
 * @ployComponent
 * @ployComponentId tabs
 * @ployComponentType component
 * @ployComponentTags tabs, switcher, measured
 * @ployComponentDescription The measured tab row. Radix owns the roving arrow keys, the ARIA wiring and the one-panel-at-a-time rule.
 * @ployComponentStatus stable
 */
export function Tabs({
  variant = "default",
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Root> &
  VariantProps<typeof tabsVariants>) {
  return (
    <TabVariant.Provider value={variant ?? "default"}>
      <TabsPrimitive.Root
        orientation={tabOrientations[variant ?? "default"].desktop}
        data-ploy-component="tabs"
        data-ploy-tabs-variant={variant ?? "default"}
        className={cn(tabsVariants({ variant }), className)}
        {...props}
      />
    </TabVariant.Provider>
  );
}

/**
 * @ployComponent
 * @ployComponentId tabs-list
 * @ployComponentType component
 * @ployComponentTags tabs, switcher, measured
 * @ployComponentDescription The row of triggers, at the source's own measured treatment.
 * @ployComponentStatus stable
 */
export function TabsList({
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.List>) {
  const variant = useContext(TabVariant);
  return (
    <TabsPrimitive.List
      data-ploy-component="tabs-list"
      className={cn(
        "inline-flex min-w-0 max-w-full overflow-x-auto items-center gap-[4px]",
        className,
      )}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId tabs-trigger
 * @ployComponentType component
 * @ployComponentTags tabs, switcher, measured
 * @ployComponentDescription One tab. Marks itself active the way the source marks its own.
 * @ployComponentStatus stable
 */
export function TabsTrigger({
  className = "",
  children,
  description,
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
  description?: string;
}) {
  const variant = useContext(TabVariant);
  return (
    <TabsPrimitive.Trigger
      data-ploy-component="tabs-trigger"
      className={cn(
        "inline-flex shrink-0 items-center justify-center whitespace-nowrap cursor-pointer",
        "px-[20px] py-[10px] text-[1.0625rem] leading-6 font-semibold",
        "text-ploy-text-secondary transition-colors disabled:pointer-events-none disabled:opacity-50",
        "data-[state=active]:text-ploy-button-secondary-text",
        // Focus stays visible — these are keyboard-navigated by definition.
        "focus-visible:outline-2 focus-visible:outline-offset-2 outline-ploy-accent-primary",
        "rounded-[20px] data-[state=active]:bg-ploy-button-secondary-background",
        className,
      )}
      {...props}
    >
      {description ? (
        <>
          <span data-ploy-tab-label="">{children}</span>
          <span data-ploy-tab-description="">{description}</span>
        </>
      ) : (
        children
      )}
    </TabsPrimitive.Trigger>
  );
}

/**
 * @ployComponent
 * @ployComponentId tabs-content
 * @ployComponentType component
 * @ployComponentTags tabs, switcher
 * @ployComponentDescription One panel. Radix mounts only the active one.
 * @ployComponentStatus stable
 */
export function TabsContent({
  className = "",
  ...props
}: ComponentPropsWithoutRef<typeof TabsPrimitive.Content>) {
  return (
    <TabsPrimitive.Content
      data-ploy-component="tabs-content"
      className={cn("outline-none", className)}
      {...props}
    />
  );
}
