import { cva } from "class-variance-authority";

/**
 * The one measured control table.
 *
 * Input, Textarea and Select all read it, so three fields side by side cannot
 * disagree about height, radius, padding or border.
 *
 * Four values here are DERIVED rather than measured, because most marketing
 * pages have one field on them — usually a bare search box — and copying it
 * literally produces a design system nobody can build a form with:
 *
 * - Colour comes from the theme's input tokens, not from the field that was
 *   measured. A translucent dark border on a search box, read literally, paints
 *   a heavy outline on every field of a white page.
 * - Type size follows the BUTTON. A control and the button beside it are one
 *   surface, and a 12px search box otherwise yields fields two steps smaller
 *   than every action next to them.
 * - Inline padding has a floor of 14px, raised further
 *   for a round corner: text needs clearance from the arc, not from the
 *   bounding box. Padding larger than half the single-line height is not
 *   shared field spacing; action clearance belongs to the section.
 * - Radius is capped at half the height, so a measured pill stays a pill on a
 *   short control instead of turning the textarea into a lozenge.
 *
 * Changing any of them here is fine — they are ordinary classes. Just know they
 * were not what the source literally measured.
 */
export const fieldVariants = cva(
  "w-full min-w-0 box-border rounded-[20px] px-[16px] py-[8px] text-[1.0625rem] leading-[2.1563rem] border-[1px] focus:border-ploy-accent-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50",
  {
    variants: {
      surface: {
        default:
          "bg-ploy-input-background border-ploy-input-border text-ploy-text-primary placeholder:text-ploy-text-secondary",
        light:
          "bg-ploy-neutral-light text-ploy-neutral-dark border-ploy-neutral-dark/20 placeholder:text-ploy-neutral-dark/50",
        dark: "bg-ploy-neutral-dark text-ploy-neutral-light border-ploy-neutral-light/30 placeholder:text-ploy-neutral-light/60",
      },
      kind: {
        fixed: "h-[52.5px]",
        grown: "py-[8px] min-h-[131.25px] resize-y rounded-[16px]",
      },
    },
    defaultVariants: { kind: "fixed", surface: "default" },
  },
);
