import type { ImgHTMLAttributes } from "react";

import { cn } from "@/lib/utils";

type LogoSize = { width?: number; height?: number };

function logoSize({ width, height }: LogoSize) {
  const ratio = 43 / 26;
  // Both given: fit inside the box. The SVG root would otherwise take the box
  // and letterbox its drawing, while a raster shrinks to fit — same call,
  // two shapes.
  if (width && height) {
    const scale = Math.min(width / 43, height / 26);
    return { width: 43 * scale, height: 26 * scale };
  }
  const w = width ?? (height ? height * ratio : 43);
  return { width: w, height: height ?? w / ratio };
}

type LogoProps = Omit<
  ImgHTMLAttributes<HTMLImageElement>,
  "src" | "width" | "height"
> &
  LogoSize;

/**
 * @ployComponent
 * @ployComponentId logo
 * @ployComponentType component
 * @ployComponentTags brand, identity, measured
 * @ployComponentDescription The selected brand identity, rendered at its measured proportions.
 * @ployComponentStatus stable
 */
export function Logo({
  className = "",
  alt = "logo",
  style,
  width,
  height,
  ...props
}: LogoProps) {
  const size = logoSize({ width, height });
  // A definite maximum keeps logo links at the requested width in flex rows.
  // Fill smaller parents; scale-down preserves small source artwork without blur.
  const capHeight = Boolean(height) || !width;
  return (
    <img
      {...props}
      src={
        "/media/666a8a64-logo.svg"
      }
      alt={alt}
      width={size.width}
      height={size.height}
      data-ploy-component="logo"
      className={cn("h-auto w-full max-w-full", className)}
      style={{
        maxWidth: size.width,
        objectFit: "scale-down",
        maxHeight: capHeight ? size.height : undefined,
        ...style,
      }}
    />
  );
}

export const logoPresentation: {
  kind: "svg" | "img" | "text";
  adaptive: boolean;
  background: string;
} = { kind: "img", adaptive: false, background: "#edf5ff" };
