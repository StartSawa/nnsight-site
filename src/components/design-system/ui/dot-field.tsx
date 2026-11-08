/**
 * nnsight.net's home background, fixed behind the page. The animation's first
 * frame paints straight away as a picture (.dot-still in globals.css, one per
 * theme), and src/lib/moving-dots.ts fades the moving version in over it. lvh
 * keeps the size steady while a phone's address bar slides away on scroll.
 */
export function DotField() {
  return (
    <>
      <div
        aria-hidden="true"
        className="dot-still pointer-events-none fixed left-0 top-0 -z-10 h-lvh w-full"
      />
      <div
        aria-hidden="true"
        data-moving-dots=""
        className="pointer-events-none fixed left-0 top-0 -z-10 h-lvh w-full opacity-0 transition-opacity duration-300 data-[ready]:opacity-100"
      />
    </>
  );
}
