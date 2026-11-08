"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as PopoverPrimitive from "@radix-ui/react-popover";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { Card } from "./card";
import { Heading } from "./heading";
import { Text } from "./text";

/**
 * The enter/exit keyframes, by overlay. Utilities from tw-animate-css, which
 * globals.css already imports.
 *
 * Applied through a prop rather than baked in: a source that changes state
 * instantly should not have its modals fade, and the measurement for that is
 * `overlayMotion`. Off, an overlay simply appears — Radix's open/closed state
 * is unaffected either way, so no behaviour changes with it.
 */
const MOTION = {
  dialog:
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0 data-[state=open]:zoom-in-95 data-[state=closed]:zoom-out-95",
  scrim:
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
  popover:
    "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
  tooltip:
    "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
} as const;

/** Lucide's `x`, inlined. One glyph does not justify a dependency. */
export function CloseIcon({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className={cn("size-4", className)}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </svg>
  );
}

/**
 * @ployComponent
 * @ployComponentId dialog
 * @ployComponentType component
 * @ployComponentTags overlay, modal, dialog
 * @ployComponentDescription A modal. Radix owns the focus trap, Escape, scroll lock and the aria-modal wiring — none of which is visible in a screenshot when it is missing.
 * @ployComponentStatus stable
 */
export function Dialog(
  props: ComponentPropsWithoutRef<typeof DialogPrimitive.Root>,
) {
  return <DialogPrimitive.Root {...props} />;
}

export function DialogTrigger(
  props: ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>,
) {
  return (
    <DialogPrimitive.Trigger data-ploy-component="dialog-trigger" {...props} />
  );
}

/**
 * @ployComponent
 * @ployComponentId dialog-content
 * @ployComponentType component
 * @ployComponentTags overlay, modal, dialog, measured
 * @ployComponentDescription The modal panel: a Card at the page's overlay elevation, portalled so an ancestor with overflow:hidden cannot clip it.
 * @ployComponentStatus stable
 */
export function DialogContent({
  children,
  className = "",
  animate = true,
  showCloseButton = true,
  ...props
}: {
  children: ReactNode;
  className?: string;
  /** Fade and zoom on open. Defaults to what this source does elsewhere. */
  animate?: boolean;
  /** The X in the top-right. Turn it off for a dialog that dismisses its own way. */
  showCloseButton?: boolean;
} & Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Content>,
  "className"
>) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay
        data-ploy-component="dialog-overlay"
        className={cn(
          "fixed inset-0 z-50 bg-black/50",
          animate && MOTION.scrim,
        )}
      />
      <DialogPrimitive.Content
        data-ploy-component="dialog-content"
        className={cn(
          "fixed left-1/2 top-1/2 z-50 w-full max-w-[520px] -translate-x-1/2 -translate-y-1/2",
          "max-h-[85vh] overflow-y-auto outline-hidden",
          animate && MOTION.dialog,
          className,
        )}
        {...props}
      >
        <Card elevation="overlay" padding="default" className="relative w-full">
          {/* The X, on by default — a modal a reader cannot see how to leave is
              worse than one with a redundant dismiss. Turn it off for a dialog
              whose own layout carries the exit. */}
          {showCloseButton ? (
            <DialogClose className="absolute right-4 top-4" />
          ) : null}
          {children}
        </Card>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

/**
 * @ployComponent
 * @ployComponentId dialog-header
 * @ployComponentType component
 * @ployComponentTags overlay, modal, dialog
 * @ployComponentDescription Title and description. Layout only: no surface of its own and no rule under it — the Card is the surface.
 * @ployComponentStatus stable
 */
export function DialogHeader({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-ploy-component="dialog-header"
      className={cn("flex flex-col gap-2", className)}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId dialog-footer
 * @ployComponentType component
 * @ployComponentTags overlay, modal, dialog
 * @ployComponentDescription The action row. Layout only: no surface and no divider above it.
 * @ployComponentStatus stable
 */
export function DialogFooter({
  className = "",
  ...props
}: ComponentPropsWithoutRef<"div">) {
  return (
    <div
      data-ploy-component="dialog-footer"
      // Stacked and reversed on a phone so the primary action sits on top, a
      // right-aligned row above it. shadcn's arrangement with no top border: a
      // rule inside a Card that already has an edge reads as a seam.
      className={cn(
        "mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end",
        className,
      )}
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId dialog-title
 * @ployComponentType component
 * @ployComponentTags overlay, modal, dialog
 * @ployComponentDescription Required by Radix: without a Title the dialog has no accessible name and Radix warns on every open. Renders through Heading, so it sits on the measured scale.
 * @ployComponentStatus stable
 */
export function DialogTitle({
  children,
  level = 3,
  className = "",
  ...props
}: {
  children: ReactNode;
  /** Which step of the measured scale. A dialog title is usually h3. */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Title>,
  "className" | "children"
>) {
  return (
    // asChild, so Radix's aria-labelledby wiring lands ON the Heading rather
    // than on a wrapper around it. Hand-rolling the type here instead gave the
    // title one fixed size and no md: step — the responsive scale exists in
    // Heading, and a dialog is not the place to fork it.
    <DialogPrimitive.Title asChild {...props}>
      <Heading
        level={level}
        data-ploy-component="dialog-title"
        className={className}
      >
        {children}
      </Heading>
    </DialogPrimitive.Title>
  );
}

/**
 * @ployComponent
 * @ployComponentId dialog-description
 * @ployComponentType component
 * @ployComponentTags overlay, modal, dialog
 * @ployComponentDescription The supporting line under the title. Renders through Text, at the page's secondary colour.
 * @ployComponentStatus stable
 */
export function DialogDescription({
  children,
  className = "",
  ...props
}: {
  children: ReactNode;
  className?: string;
} & Omit<
  ComponentPropsWithoutRef<typeof DialogPrimitive.Description>,
  "className" | "children"
>) {
  return (
    <DialogPrimitive.Description asChild {...props}>
      <Text
        data-ploy-component="dialog-description"
        className={cn("text-ploy-text-secondary", className)}
      >
        {children}
      </Text>
    </DialogPrimitive.Description>
  );
}

/**
 * @ployComponent
 * @ployComponentId dialog-close
 * @ployComponentType component
 * @ployComponentTags overlay, modal, dialog
 * @ployComponentDescription Dismisses the dialog. Pass children to use your own control; with none it draws the X.
 * @ployComponentStatus stable
 */
export function DialogClose({
  children,
  className = "",
  ...props
}: {
  children?: ReactNode;
  className?: string;
} & Omit<ComponentPropsWithoutRef<typeof DialogPrimitive.Close>, "className">) {
  return (
    <DialogPrimitive.Close
      data-ploy-component="dialog-close"
      className={cn(
        children
          ? ""
          : "cursor-pointer opacity-70 transition-opacity hover:opacity-100",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <CloseIcon />
          <span className="sr-only">Close</span>
        </>
      )}
    </DialogPrimitive.Close>
  );
}

/**
 * @ployComponent
 * @ployComponentId popover
 * @ployComponentType component
 * @ployComponentTags overlay, popover
 * @ployComponentDescription A non-modal panel anchored to its trigger. Closes on outside pointerdown and Escape, and restores focus.
 * @ployComponentStatus stable
 */
export function Popover(
  props: ComponentPropsWithoutRef<typeof PopoverPrimitive.Root>,
) {
  return <PopoverPrimitive.Root {...props} />;
}

export function PopoverTrigger(
  props: ComponentPropsWithoutRef<typeof PopoverPrimitive.Trigger>,
) {
  return (
    <PopoverPrimitive.Trigger
      data-ploy-component="popover-trigger"
      {...props}
    />
  );
}

export function PopoverAnchor(
  props: ComponentPropsWithoutRef<typeof PopoverPrimitive.Anchor>,
) {
  return (
    <PopoverPrimitive.Anchor data-ploy-component="popover-anchor" {...props} />
  );
}

/**
 * @ployComponent
 * @ployComponentId popover-content
 * @ployComponentType component
 * @ployComponentTags overlay, popover, measured
 * @ployComponentDescription The popover panel. shadcn's positioning and motion; the surface is this page's own Card at overlay elevation.
 * @ployComponentStatus stable
 */
export function PopoverContent({
  children,
  className = "",
  align = "center",
  sideOffset = 4,
  animate = true,
  ...props
}: {
  children: ReactNode;
  className?: string;
  /** Fade, zoom and slide from the trigger's side. */
  animate?: boolean;
} & Omit<
  ComponentPropsWithoutRef<typeof PopoverPrimitive.Content>,
  "className"
>) {
  return (
    <PopoverPrimitive.Portal>
      <PopoverPrimitive.Content
        data-ploy-component="popover-content"
        align={align}
        sideOffset={sideOffset}
        className={cn(
          "z-50 w-72 origin-(--radix-popover-content-transform-origin) outline-hidden",
          animate && MOTION.popover,
          className,
        )}
        {...props}
      >
        {/* shadcn's surface classes are gone on purpose: bg-popover, border,
            p-4, rounded-md and shadow-md are its tokens, and this Card already
            carries the page's measured equivalents. */}
        <Card elevation="overlay" className="w-full">
          {children}
        </Card>
      </PopoverPrimitive.Content>
    </PopoverPrimitive.Portal>
  );
}

/**
 * @ployComponent
 * @ployComponentId tooltip-provider
 * @ployComponentType component
 * @ployComponentTags overlay, tooltip
 * @ployComponentDescription Radix requires one above any tooltip. Tooltip mounts its own, so this is only needed to share a delay across a page.
 * @ployComponentStatus stable
 */
export function TooltipProvider({
  delayDuration = 0,
  ...props
}: ComponentPropsWithoutRef<typeof TooltipPrimitive.Provider>) {
  return <TooltipPrimitive.Provider delayDuration={delayDuration} {...props} />;
}

/**
 * @ployComponent
 * @ployComponentId tooltip
 * @ployComponentType component
 * @ployComponentTags overlay, tooltip
 * @ployComponentDescription A label on hover and on keyboard focus. Wraps its own Provider so a single tooltip works without one.
 * @ployComponentStatus stable
 */
export function Tooltip(
  props: ComponentPropsWithoutRef<typeof TooltipPrimitive.Root>,
) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root {...props} />
    </TooltipProvider>
  );
}

export function TooltipTrigger(
  props: ComponentPropsWithoutRef<typeof TooltipPrimitive.Trigger>,
) {
  return (
    <TooltipPrimitive.Trigger
      data-ploy-component="tooltip-trigger"
      {...props}
    />
  );
}

/**
 * @ployComponent
 * @ployComponentId tooltip-content
 * @ployComponentType component
 * @ployComponentTags overlay, tooltip, measured
 * @ployComponentDescription The label itself. NOT a card: a tooltip is a label, so it takes the page's inverse surface rather than the overlay elevation.
 * @ployComponentStatus stable
 */
export function TooltipContent({
  className = "",
  sideOffset = 0,
  children,
  animate = true,
  ...props
}: {
  className?: string;
  /** Fade, zoom and slide in. */
  animate?: boolean;
} & Omit<
  ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>,
  "className"
>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-ploy-component="tooltip-content"
        sideOffset={sideOffset}
        // shadcn's class list with one substitution: the fill is this page's
        // INVERSE surface rather than `bg-primary`, a token no tenant has.
        className={cn(
          "bg-ploy-background-inverse text-ploy-text-inverse",
          "z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-[8px] px-3 py-1.5 text-xs text-balance",
          animate && MOTION.tooltip,
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-ploy-background-inverse fill-ploy-background-inverse z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
