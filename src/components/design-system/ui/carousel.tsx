"use client";

import "./carousel.css";

import { cva } from "class-variance-authority";
import { ArrowLeft, ArrowRight } from "lucide-react";
import {
  useEffect,
  useState,
  type ButtonHTMLAttributes,
  type HTMLAttributes,
} from "react";
import type { Swiper as CarouselApi } from "swiper";
import { A11y, Navigation, Pagination } from "swiper/modules";
import { Swiper, type SwiperProps } from "swiper/react";

import { cn } from "@/lib/utils";

// Preserve SwiperSlide's identity: Swiper uses it to find and index slides.
export { SwiperSlide as CarouselSlide, useSwiper } from "swiper/react";
export type { CarouselApi };

// Swiper sizes and centers the button with --swiper-navigation-size. Its SVG
// fills the content box, so padding keeps the arrow smaller than the target.
const carouselVariants = cva([
  "w-full min-w-0 [--swiper-theme-color:currentColor] [--swiper-navigation-size:40px]",
  "[&>:is(.swiper-button-prev,.swiper-button-next)]:p-[11px]",
  "[&>:is(.swiper-button-prev,.swiper-button-next)]:rounded-full",
  "[&>:is(.swiper-button-prev,.swiper-button-next)]:bg-ploy-neutral-light",
  "[&>:is(.swiper-button-prev,.swiper-button-next)]:text-ploy-neutral-dark",
  "[&>:is(.swiper-button-prev,.swiper-button-next)]:shadow-sm",
  "[&>:is(.swiper-button-prev,.swiper-button-next)]:focus-visible:outline-2",
  "[&>:is(.swiper-button-prev,.swiper-button-next)]:focus-visible:outline-offset-2",
]);

export type CarouselControlProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick"
> & {
  direction: "previous" | "next";
  api: CarouselApi | null;
};

// Direction owns both the glyph and action so captured icon IDs cannot reverse one.
// Supply className for the measured size, background, border, radius and states;
// these neutral defaults do not reproduce a source control surface.
export function CarouselControl({
  direction,
  api,
  className,
  disabled,
  "aria-label": label,
  ...props
}: CarouselControlProps) {
  const previous = direction === "previous";
  const Arrow = previous ? ArrowLeft : ArrowRight;
  const [atEdge, setAtEdge] = useState(false);
  useEffect(() => {
    if (!api) return;
    const sync = () =>
      setAtEdge(
        !api.params.loop &&
          !api.params.rewind &&
          (previous ? api.isBeginning : api.isEnd),
      );
    const events = [
      "slideChange",
      "reachBeginning",
      "reachEnd",
      "fromEdge",
      "resize",
      "update",
    ] as const;
    sync();
    events.forEach((event) => api.on(event, sync));
    return () => {
      events.forEach((event) => api.off(event, sync));
    };
  }, [api, previous]);
  return (
    <button
      {...props}
      type="button"
      data-carousel-direction={direction}
      aria-label={label ?? (previous ? "Previous slide" : "Next slide")}
      disabled={!api || disabled || atEdge}
      className={cn(
        "inline-flex size-10 cursor-pointer items-center justify-center disabled:opacity-50 focus-visible:outline-2 focus-visible:outline-offset-2",
        className,
      )}
      onClick={() => (previous ? api?.slidePrev() : api?.slideNext())}
    >
      <Arrow size={18} className="mx-auto shrink-0" aria-hidden="true" />
    </button>
  );
}

export type CarouselProps = SwiperProps;

export type CarouselPageProgressProps = HTMLAttributes<HTMLDivElement> & {
  api: CarouselApi | null;
};

/**
 * @ployComponent
 * @ployComponentId carousel-page-progress
 * @ployComponentType component
 * @ployComponentTags carousel, progress, finite
 * @ployComponentDescription A growing page rail for a finite carousel. Supply its CarouselApi; style height, background and text color. Snap changes and resizing update the fill.
 * @ployComponentStatus stable
 */
export function CarouselPageProgress({
  api,
  className,
  "aria-label": label = "Carousel position",
  ...props
}: CarouselPageProgressProps) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!api) return;
    const sync = () =>
      setValue(
        Math.min(
          100,
          (100 * (api.snapIndex + 1)) / Math.max(1, api.snapGrid.length),
        ),
      );
    sync();
    api.on("snapIndexChange", sync);
    api.on("snapGridLengthChange", sync);
    api.on("resize", sync);
    return () => {
      api.off("snapIndexChange", sync);
      api.off("snapGridLengthChange", sync);
      api.off("resize", sync);
    };
  }, [api]);
  return (
    <div
      {...props}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      className={cn("h-px w-full bg-ploy-border-primary", className)}
    >
      <div className="h-full bg-current" style={{ width: value + "%" }} />
    </div>
  );
}

/**
 * @ployComponent
 * @ployComponentId carousel
 * @ployComponentType component
 * @ployComponentTags slides, navigation, responsive
 * @ployComponentDescription A styled slide track with accessible navigation and pagination. Supply CarouselSlide children and measured Swiper layout options.
 * @ployComponentStatus stable
 */
export function Carousel({
  className,
  modules = [],
  loop = true,
  ...props
}: CarouselProps) {
  return (
    <Swiper
      loop={loop}
      modules={[A11y, Navigation, Pagination, ...modules]}
      data-ploy-component="carousel"
      className={cn(carouselVariants(), className)}
      {...props}
    />
  );
}
