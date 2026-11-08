import { cva } from "class-variance-authority";

import { cn } from "@/lib/utils";

import type { ComponentProps, ReactNode } from "react";

import "./marquee.css";

const marqueeVariants = cva(
  "flex min-w-0 min-h-0 gap-[var(--gap)] overflow-hidden [--duration:40s] [--gap:1rem] [--fade:3rem]",
  { variants: { vertical: { true: "flex-col", false: "flex-row" } } },
);

export type MarqueeProps = ComponentProps<"div"> & {
  children: ReactNode;
  reverse?: boolean;
  pauseOnHover?: boolean;
  paused?: boolean;
  vertical?: boolean;
  /** Integer >= 2. Leave omitted for the default four copies. */
  repeat?: number;
  fade?: boolean;
};

/**
 * @ployComponent
 * @ployComponentId marquee
 * @ployComponentType component
 * @ployComponentTags motion, logos, ticker
 * @ployComponentDescription Automatically repeats display content. Set --duration, --gap and --fade with className. Vertical mode requires a fixed height. Copies are decorative; use a carousel for interactive slides.
 * @ployComponentStatus stable
 */
export function Marquee({
  className,
  reverse = false,
  pauseOnHover = false,
  paused = false,
  children,
  vertical = false,
  repeat = 4,
  fade = true,
  ...props
}: MarqueeProps) {
  if (!Number.isSafeInteger(repeat) || repeat < 2) {
    throw new RangeError("Marquee repeat must be an integer of at least 2.");
  }

  return (
    <div
      data-ploy-component="marquee"
      data-vertical={vertical}
      data-reverse={reverse}
      data-pause-on-hover={pauseOnHover}
      data-paused={paused}
      data-fade={fade}
      className={cn(marqueeVariants({ vertical }), className)}
      {...props}
    >
      {/* A full-width group prevents an empty strip when the content is short.
          Only the first copy belongs in the accessibility and focus trees. */}
      {Array.from({ length: repeat }, (_, index) => (
        <div
          data-marquee-group=""
          key={index}
          aria-hidden={index > 0 || undefined}
          inert={index > 0 || undefined}
        >
          {children}
        </div>
      ))}
    </div>
  );
}
