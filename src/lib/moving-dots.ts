/**
 * Brings the home page's dots to life, with nnsight.net's library and its light
 * and dark settings.
 *
 * The page paints straight away with a still picture of the dots (DotField),
 * which is the animation's first frame. As soon as the page's own files are in,
 * this fetches the library and fades the moving version in over the picture, so
 * the dots seem to be moving from the start. Visitors who asked for less motion
 * or less data keep the picture, and so does any device without WebGL.
 */
type VantaEffect = { destroy(): void };

declare global {
  interface Window {
    THREE?: unknown;
    VANTA?: { DOTS(options: Record<string, unknown>): VantaEffect };
  }
}

const root = document.documentElement;
const isDark = () => root.classList.contains("dark");

function addScript(src: string) {
  return new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Could not load ${src}`));
    document.head.append(script);
  });
}

function wantsStillDots() {
  const connection = (
    navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }
  ).connection;
  return (
    matchMedia("(prefers-reduced-motion: reduce)").matches ||
    connection?.saveData === true ||
    connection?.effectiveType?.includes("2g") === true
  );
}

let effect: VantaEffect | undefined;

function draw(field: HTMLElement) {
  effect?.destroy();
  delete field.dataset.ready;

  const dark = isDark();
  effect = window.VANTA?.DOTS({
    el: field,
    THREE: window.THREE,
    mouseControls: false,
    touchControls: false,
    gyroControls: false,
    minHeight: 200,
    minWidth: 200,
    scale: 1,
    scaleMobile: 1,
    color: dark ? 0xcecdc3 : 0x000000,
    color2: dark ? 0xcecdc3 : 0x000000,
    backgroundColor: dark ? 0x100f0f : 0xffffff,
    size: dark ? 0.5 : 1,
    spacing: 10,
    showLines: false,
  });

  // Without WebGL, Vanta leaves no canvas: stay on the picture.
  if (field.querySelector("canvas")) {
    // Vanta wipes its canvas when it resizes on the next frame. Reveal it after
    // that, so the fade starts from dots and not a blank.
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        field.dataset.ready = "";
      }),
    );
  }
}

async function start() {
  const field = document.querySelector<HTMLElement>("[data-moving-dots]");
  if (!field) return;

  // Load order matters: Vanta needs three.js already on the page.
  await addScript("/vendor/three-r134.min.js");
  await addScript("/vendor/vanta.dots-0.5.24.min.js");
  draw(field);

  // Redraw with the other settings when the theme toggle flips.
  let drawnDark = isDark();
  new MutationObserver(() => {
    if (isDark() === drawnDark) return;
    drawnDark = isDark();
    draw(field);
  }).observe(root, { attributes: true, attributeFilter: ["class"] });
}

function begin() {
  start().catch(() => {
    // Decorative only: the still picture is the correct fallback.
  });
}

// Start the moment the page's own files are in, with no extra wait: any sooner
// and this big download competes with the logo, any later and the motion feels
// late on landing.
if (!wantsStillDots()) {
  if (document.readyState === "complete") {
    begin();
  } else {
    window.addEventListener("load", begin, { once: true });
  }
}

export {};
