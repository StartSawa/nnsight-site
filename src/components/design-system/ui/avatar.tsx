import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";
import type { ImgHTMLAttributes } from "react";

// A portrait is cropped square and rounded the way the brand rounds people.
// `shrink-0` because an avatar in a flex row is the first thing to get
// squashed, and a squashed face is unmistakable.
const avatarVariants = cva("shrink-0 object-cover", {
  variants: {
    shape: {
      circle: "rounded-full",
      rounded: "rounded-[16px]",
      square: "rounded-none",
    },
    // The three sizes the source actually renders, not a scale someone liked.
    size: {
      sm: "h-[32px] w-[32px]",
      md: "h-[48px] w-[48px]",
      lg: "h-[80px] w-[80px]",
    },
  },
  defaultVariants: { shape: "circle", size: "md" },
});

type AvatarProps = ImgHTMLAttributes<HTMLImageElement> &
  VariantProps<typeof avatarVariants> & {
    children?: never;
    dangerouslySetInnerHTML?: never;
  };

/**
 * @ployComponent
 * @ployComponentId avatar
 * @ployComponentType component
 * @ployComponentTags portrait, person, measured
 * @ployComponentDescription Use <Avatar src={url} alt={name} size="md" /> for a person, cropped square at the measured size. Avatar renders img directly: never nest img or initials inside it.
 * @ployComponentStatus stable
 */
export function Avatar({
  shape = "circle",
  size = "md",
  className = "",
  alt = "",
  children: _children,
  dangerouslySetInnerHTML: _dangerouslySetInnerHTML,
  ...props
}: AvatarProps) {
  return (
    <img
      alt={alt}
      decoding="async"
      data-ploy-component="avatar"
      className={cn(avatarVariants({ shape, size }), className)}
      {...props}
    />
  );
}
