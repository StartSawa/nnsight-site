import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

// Generated motion lib (animation-motion-lib). Timing comes from the feel.
const FEELS = {
  conservative: {
    ease: "expo.out",
    entrance: 1.2,
    frame: 1.7,
    stagger: 0.12,
    start: "top 80%",
    lerp: 0.15,
  },
  creative: {
    ease: "expo.out",
    entrance: 1,
    frame: 1.5,
    stagger: 0.08,
    start: "top 80%",
    lerp: 0.12,
  },
};
/** The site's motion feel; switch it here. */
export const FEEL: keyof typeof FEELS = "conservative";
export const MOTION = FEELS[FEEL];
export const MEDIA = {
  desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
  mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
  reduced: "(prefers-reduced-motion: reduce)",
};
export const SPLIT = {
  type: "lines",
  mask: "lines",
  linesClass: "split-line",
  autoSplit: true,
} as const;

let lenis: Lenis | null = null;
let started = false;
export function initMotion({ smooth = false, lerp = MOTION.lerp } = {}) {
  if (typeof window === "undefined") return lenis;
  if (!started) {
    started = true;
    gsap.registerPlugin(ScrollTrigger, SplitText);
    const refresh = () => ScrollTrigger.refresh();
    if (document.readyState === "complete") requestAnimationFrame(refresh);
    else addEventListener("load", refresh, { once: true });
    document.fonts.ready.then(refresh);
    document.documentElement.dataset.motionReady = "1";
  }
  // Lenis only for scroll-linked GSAP (scrub, pin); a later smooth call adds it.
  if (smooth && !lenis && !matchMedia(MEDIA.reduced).matches) {
    lenis = new Lenis({ lerp, autoRaf: false }); // lower lerp = more glide
    lenis.on("scroll", ScrollTrigger.update);
    gsap.ticker.add((t) => lenis!.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
  return lenis;
}

/** Lines rise through padded masks; each line switches on as its rise starts. */
export function riseLines(
  tl: gsap.core.Timeline,
  el: Element,
  lines: Element[],
  at: number,
) {
  tl.set(el, { opacity: 1 }, at)
    .fromTo(
      lines,
      { yPercent: 130, opacity: 0 },
      { yPercent: 0, duration: MOTION.entrance, stagger: MOTION.stagger },
      at,
    )
    .to(lines, { opacity: 1, duration: 0.01, stagger: MOTION.stagger }, at);
}

export { gsap, ScrollTrigger, SplitText };
