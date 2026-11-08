import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { ImgHTMLAttributes } from "react";

// Two shapes, and the component picks between them so a call site cannot get
// the pairing wrong.
//
// In normal flow an image wants `h-auto max-w-full`: it keeps its own
// proportions and never overflows its column. Inside a fixed-ratio box it wants
// the opposite — `h-full w-full object-cover` — or it sits at its intrinsic
// height in the corner of the frame with the rest of the box empty. Written by
// hand, the frame and the fill classes get separated: a section wraps an
// `aspect-[5/3]` div around an image that then does not fill it. Passing
// `ratio` here brings both halves at once.
// object-cover sits in the BASE, not only under the filled variant.
//
// object-fit does nothing to an image that is sizing itself, so this costs an
// unconstrained image nothing. It costs a CONSTRAINED one the whole defect: a
// run wrapped its own h-[180px] div around an image and passed
// className="h-full w-full", which sets both dimensions and stretches the
// photograph to fit them. Framing an image by hand is legitimate; squashing a
// face is not, and cropping is the only sane reading of both dimensions given.
const imageVariants = cva("block object-cover", {
  variants: {
    filled: {
      true: "h-full w-full object-cover",
      false: "h-auto max-w-full",
    },
    // The theme token, not a baked px: the theme editor and theme_write move
    // it. Sites built before the token existed fall back to the card radius.
    rounded: {
      default: "rounded-[var(--radius-image,var(--radius-card))]",
      // Old name for default; tenant sites already call it.
      card: "rounded-[var(--radius-image,var(--radius-card))]",
      none: "rounded-none",
      full: "rounded-full",
    },
  },
  defaultVariants: { filled: false, rounded: "default" },
});

const RATIOS = {
  square: "aspect-square",
  "4/3": "aspect-[4/3]",
  "3/2": "aspect-[3/2]",
  "16/9": "aspect-video",
  "5/3": "aspect-[5/3]",
} as const;

type ImageProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "width" | "height"
> &
  Pick<VariantProps<typeof imageVariants>, "rounded"> & {
    children?: never;
    dangerouslySetInnerHTML?: never;
    /** A fixed frame. The image fills it — the two are not separable. */
    ratio?: keyof typeof RATIOS | number;
    /** How the picture fills a frame. Cropping is the default. */
    fit?: "cover" | "contain";
    /** Edge to edge: always square, whatever `rounded` says. */
    fullBleed?: boolean;
  };

/**
 * @ployComponent
 * @ployComponentId image
 * @ployComponentType component
 * @ployComponentTags media, artwork, measured
 * @ployComponentDescription Use <Image src={url} alt={description} /> in the column; it takes the site's image radius. fullBleed: edge to edge, always square. rounded="none": a deliberate square. People: Avatar, not rounded="full". ratio={width / height} sets an exact frame; presets like ratio="16/9" work. Never nest children; put captions beside Image.
 * @ployComponentStatus stable
 */
export function Image({
  ratio,
  fit = "cover",
  rounded: requested = "default",
  fullBleed = false,
  className = "",
  alt = "",
  children: _children,
  dangerouslySetInnerHTML: _dangerouslySetInnerHTML,
  ...props
}: ImageProps) {
  // KRBY096 image-radius-is-the-theme-token: an edge-to-edge image has no
  // corner to round, so fullBleed wins over any rounded value, silently.
  const rounded = fullBleed ? "none" : requested;
  const image = (
    <img
      alt={alt}
      decoding="async"
      data-ploy-component="image"
      className={cn(
        imageVariants({
          filled: Boolean(ratio),
          rounded: ratio ? "none" : rounded,
        }),
        fit === "contain" && "object-contain",
        !ratio && className,
      )}
      {...props}
    />
  );
  if (!ratio) return image;
  // The frame owns the radius, or the corners clip the box and not the picture.
  return (
    <div
      style={typeof ratio === "number" ? { aspectRatio: ratio } : undefined}
      className={cn(
        "overflow-hidden",
        typeof ratio === "string" && RATIOS[ratio],
        // Only the radius from the variants — the frame sizes itself.
        imageVariants({ rounded, filled: false }).replace(
          "h-auto max-w-full",
          "",
        ),
        className,
      )}
    >
      {image}
    </div>
  );
}
