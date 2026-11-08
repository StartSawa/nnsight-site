import { useEffect, useRef } from "react";
import { initMotion, ScrollTrigger } from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * GPT-2 running the homepage example. Rows are the 10 prompt tokens
 * (torch.Size([1, 10, 768])); columns are the embedding plus the 12 blocks
 * model.transformer.h[0..11]. Each node is one token's residual-stream state
 * after a layer. Edges are the residual path (same token, next layer) and
 * causal attention (an earlier token feeding a later one). Signals only flow
 * forward, left to right, and the last token's final state predicts ' Paris'.
 */
const TOKENS = ["The", " E", "iff", "el", " Tower", " is", " in", " the", " city", " of"];
const BLOCKS = 12;
const COLS = BLOCKS + 1; // embedding + h[0..11]
const T = TOKENS.length;
const PREDICTION = "' Paris'";

type Pulse = { from: number; to: number; t: number; dur: number; violet: boolean };

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

const id = (layer: number, token: number) => layer * T + token;

function build(seed: number) {
  const r = rng(seed);
  const pos: { x: number; y: number; z: number }[] = [];
  for (let l = 0; l < COLS; l++) {
    for (let t = 0; t < T; t++) {
      pos.push({
        x: -1.9 + (l / (COLS - 1)) * 3.8,
        y: -0.95 + (t / (T - 1)) * 1.9,
        z: (r() * 2 - 1) * 0.12,
      });
    }
  }
  const edges: { a: number; b: number; attn: boolean }[] = [];
  const out: number[][] = pos.map(() => []);
  for (let l = 0; l < COLS - 1; l++) {
    for (let t = 0; t < T; t++) {
      const b = id(l + 1, t);
      edges.push({ a: id(l, t), b, attn: false });
      out[id(l, t)].push(b);
      // Causal attention: each token reads up to two earlier tokens.
      const reads = new Set<number>();
      for (let k = 0; k < 2 && t > 0; k++) reads.add(Math.floor(r() * t));
      reads.forEach((src) => {
        edges.push({ a: id(l, src), b, attn: true });
        out[id(l, src)].push(b);
      });
    }
  }
  return { pos, edges, out };
}

function glowSprite(rgb: string) {
  const c = document.createElement("canvas");
  c.width = c.height = 64;
  const x = c.getContext("2d")!;
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, `rgba(${rgb},0.9)`);
  g.addColorStop(0.25, `rgba(${rgb},0.35)`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  x.fillStyle = g;
  x.fillRect(0, 0, 64, 64);
  return c;
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/**
 * @ployComponent
 * @ployComponentId neural-net
 * @ployComponentType component
 * @ployComponentTags motion, canvas, graphic, transformer
 * @ployComponentDescription Animated GPT-2 diagram on canvas for the homepage example: 10 prompt tokens by the embedding and 12 transformer blocks, residual and causal-attention edges, signals flowing forward to the ' Paris' prediction. Lens windows frame model.transformer.h[5] and h[-1]; on desktop the first lens moves to the block under the pointer. Turns slightly with scroll; still frame under reduced motion. Fills its parent.
 * @ployComponentStatus stable
 */
export function NeuralNet({
  seed = 7,
  pulses = 34,
  className,
}: {
  seed?: number;
  pulses?: number;
  className?: string;
}) {
  const wrap = useRef<HTMLDivElement>(null);
  const cvs = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const el = wrap.current;
    const canvas = cvs.current;
    if (!el || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    initMotion();

    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
    const { pos, edges, out } = build(seed);
    const blue = glowSprite("120,160,255");
    const violet = glowSprite("196,140,255");
    const r = rng(seed * 31 + 5);

    let W = 0;
    let H = 0;
    let dpr = 1;
    let progress = 0;
    let pointerX: number | null = null;
    // Lens A sits on a block (default h[5]); lens B is h[-1].
    let lensBlock = 5;
    const lensA = { x: 0, y: 0, w: 0, h: 0, ready: false };
    const lensB = { x: 0, y: 0, w: 0, h: 0, ready: false };
    let predict = 0; // brightness of the ' Paris' readout

    const spawn = (): Pulse => {
      const from = id(0, Math.floor(r() * T));
      const o = out[from];
      return { from, to: o[Math.floor(r() * o.length)], t: 0, dur: 0.45 + r() * 0.35, violet: false };
    };
    const live: Pulse[] = Array.from({ length: pulses }, () => {
      const p = spawn();
      // Stagger the opening wave across the first few layers.
      for (let h = Math.floor(r() * 6); h > 0; h--) {
        const o = out[p.to];
        if (!o.length) break;
        p.from = p.to;
        p.to = o[Math.floor(r() * o.length)];
      }
      p.t = r();
      return p;
    });

    const proj = new Float32Array(pos.length * 3);
    const start = performance.now();
    let last = start;
    let clock = 0;

    function project() {
      const narrow = W <= 560;
      const unit = Math.min(W * (narrow ? 0.165 : 0.2), H * 0.38);
      const angle = -0.24 + progress * 0.3 + (reduced ? 0 : Math.sin(clock * 0.18) * 0.04);
      const tilt = 0.14;
      const ca = Math.cos(angle), sa = Math.sin(angle);
      const ct = Math.cos(tilt), st = Math.sin(tilt);
      for (let i = 0; i < pos.length; i++) {
        const n = pos[i];
        const x1 = n.x * ca - n.z * sa;
        const z1 = n.x * sa + n.z * ca;
        const y1 = n.y * ct - z1 * st;
        const z2 = n.y * st + z1 * ct;
        const s = 6 / (6 + z2);
        proj[i * 3] = W / 2 + x1 * s * unit - W * (narrow ? 0.1 : 0.02);
        proj[i * 3 + 1] = H / 2 + y1 * s * unit;
        proj[i * 3 + 2] = Math.min(1, Math.max(0, (z2 + 1.4) / 2.8));
      }
    }

    function colRect(layer: number) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (let t = 0; t < T; t++) {
        const i = id(layer, t);
        x0 = Math.min(x0, proj[i * 3]);
        x1 = Math.max(x1, proj[i * 3]);
        y0 = Math.min(y0, proj[i * 3 + 1]);
        y1 = Math.max(y1, proj[i * 3 + 1]);
      }
      const pad = Math.max(10, W * 0.014);
      return { x: x0 - pad, y: y0 - pad, w: x1 - x0 + pad * 2, h: y1 - y0 + pad * 2 };
    }

    const resize = () => {
      const b = el.getBoundingClientRect();
      W = b.width;
      H = b.height;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      lensA.ready = lensB.ready = false;
      if (reduced) draw(0);
    };

    const layerOf = (i: number) => Math.floor(i / T);

    function draw(dt: number) {
      clock += dt;
      const now = performance.now();
      const intro = reduced ? 1 : Math.min(1, (now - start) / 1600);
      const fade = 1 - Math.pow(1 - intro, 3);
      project();

      // Pointer picks the block under it for lens A.
      if (pointerX !== null) {
        let best = lensBlock, bestD = Infinity;
        for (let b = 0; b < BLOCKS; b++) {
          const d = Math.abs(proj[id(b + 1, T - 1) * 3] - pointerX);
          if (d < bestD) (bestD = d), (best = b);
        }
        lensBlock = best;
      }
      const showB = lensBlock !== BLOCKS - 1;
      const k = reduced ? 1 : Math.min(1, dt * 10);
      const ta = colRect(lensBlock + 1);
      const tb = colRect(BLOCKS);
      for (const [lens, tr] of [[lensA, ta], [lensB, tb]] as const) {
        const kk = lens.ready ? k : 1;
        lens.x = lerp(lens.x, tr.x, kk);
        lens.y = lerp(lens.y, tr.y, kk);
        lens.w = lerp(lens.w, tr.w, kk);
        lens.h = lerp(lens.h, tr.h, kk);
        lens.ready = true;
      }
      const litLayer = (l: number) => l === lensBlock + 1 || (showB && l === BLOCKS);

      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.clearRect(0, 0, W, H);

      // Edges: residual path brighter than attention reads.
      for (const e of edges) {
        const ax = proj[e.a * 3], ay = proj[e.a * 3 + 1], ad = proj[e.a * 3 + 2];
        const bx = proj[e.b * 3], by = proj[e.b * 3 + 1], bd = proj[e.b * 3 + 2];
        const lit = litLayer(layerOf(e.b));
        const near = 1 - (ad + bd) / 2;
        const base = e.attn ? 0.05 + near * 0.12 : 0.14 + near * 0.26;
        ctx!.globalAlpha = fade * (lit ? base * 2 : base);
        ctx!.strokeStyle = lit ? "rgb(190,130,255)" : "rgb(92,128,235)";
        ctx!.lineWidth = e.attn ? 0.7 : 1;
        ctx!.beginPath();
        ctx!.moveTo(ax, ay);
        ctx!.lineTo(bx, by);
        ctx!.stroke();
      }

      // Nodes
      for (let i = 0; i < pos.length; i++) {
        const x = proj[i * 3], y = proj[i * 3 + 1], d = proj[i * 3 + 2];
        const lit = litLayer(layerOf(i));
        const near = 1 - d;
        const rad = (lit ? 1.7 : 1.2) + near * 1.6;
        const g = rad * 7;
        ctx!.globalAlpha = fade * (0.25 + near * 0.5);
        ctx!.drawImage(lit ? violet : blue, x - g / 2, y - g / 2, g, g);
        ctx!.globalAlpha = fade * (0.55 + near * 0.45);
        ctx!.fillStyle = lit ? "rgb(232,210,255)" : "rgb(214,226,255)";
        ctx!.beginPath();
        ctx!.arc(x, y, rad, 0, Math.PI * 2);
        ctx!.fill();
      }

      // Forward pass: signals hop one layer at a time toward the output.
      if (!reduced) {
        for (let p = 0; p < live.length; p++) {
          const s = live[p];
          s.t += dt / s.dur;
          if (s.t >= 1) {
            if (litLayer(layerOf(s.to))) s.violet = true;
            const o = out[s.to];
            if (!o.length) {
              if (s.to === id(BLOCKS, T - 1)) predict = 1;
              live[p] = spawn();
              continue;
            }
            s.from = s.to;
            // The last token is where the prediction is read: steer some signals there.
            const toLast = o.find((n) => n % T === T - 1);
            s.to = toLast !== undefined && r() < 0.25 ? toLast : o[Math.floor(r() * o.length)];
            s.t = 0;
          }
          const ax = proj[s.from * 3], ay = proj[s.from * 3 + 1];
          const bx = proj[s.to * 3], by = proj[s.to * 3 + 1];
          const hx = lerp(ax, bx, s.t), hy = lerp(ay, by, s.t);
          const t0 = Math.max(0, s.t - 0.45);
          const tx = lerp(ax, bx, t0), ty = lerp(ay, by, t0);
          const c = s.violet ? "200,150,255" : "150,185,255";
          const grd = ctx!.createLinearGradient(tx, ty, hx, hy);
          grd.addColorStop(0, `rgba(${c},0)`);
          grd.addColorStop(1, `rgba(${c},0.95)`);
          ctx!.globalAlpha = fade;
          ctx!.strokeStyle = grd;
          ctx!.lineWidth = 1.6;
          ctx!.beginPath();
          ctx!.moveTo(tx, ty);
          ctx!.lineTo(hx, hy);
          ctx!.stroke();
          ctx!.drawImage(s.violet ? violet : blue, hx - 9, hy - 9, 18, 18);
        }
      }
      predict = reduced ? 1 : Math.max(0.55, predict - dt * 0.6);

      const wide = W > 560;
      const mono = (px: number, w = 500) => `${w} ${px}px 'Geist Mono', ui-monospace, monospace`;

      // Token labels on the input side.
      if (wide) {
        ctx!.font = mono(11);
        ctx!.textAlign = "right";
        ctx!.textBaseline = "middle";
        TOKENS.forEach((tok, t) => {
          const i = id(0, t);
          ctx!.globalAlpha = fade * 0.5;
          ctx!.fillStyle = "rgb(214,226,255)";
          ctx!.fillText(JSON.stringify(tok).replace(/"/g, "'"), proj[i * 3] - 14, proj[i * 3 + 1]);
        });
      }

      // Prediction read off the last token's final state.
      const lastI = id(BLOCKS, T - 1);
      const ox = proj[lastI * 3] + (wide ? 32 : 14);
      const oy = proj[lastI * 3 + 1];
      ctx!.textAlign = "left";
      ctx!.textBaseline = "middle";
      ctx!.font = mono(wide ? 14 : 10, 600);
      ctx!.globalAlpha = fade * predict;
      ctx!.fillStyle = "rgb(236,222,255)";
      ctx!.fillText(PREDICTION, ox, oy);

      // Lens frames and labels
      ctx!.textAlign = "left";
      ctx!.textBaseline = "alphabetic";
      ctx!.font = mono(11);
      const frames: [typeof lensA, string][] = [
        [lensA, `model.transformer.h[${lensBlock}].output`],
      ];
      if (showB) frames.push([lensB, "model.transformer.h[-1].output"]);
      frames.forEach(([l, label], i) => {
        ctx!.globalAlpha = fade;
        ctx!.fillStyle = "rgba(161,52,235,0.08)";
        ctx!.fillRect(l.x, l.y, l.w, l.h);
        ctx!.strokeStyle = "rgba(255,255,255,0.4)";
        ctx!.lineWidth = 1;
        ctx!.strokeRect(Math.round(l.x) + 0.5, Math.round(l.y) + 0.5, Math.round(l.w), Math.round(l.h));
        if (wide) {
          ctx!.fillStyle = "rgba(255,255,255,0.66)";
          const tw = ctx!.measureText(label).width;
          const lx = i === 0 ? l.x : Math.min(l.x, W - tw - 16);
          ctx!.fillText(label, Math.round(lx), Math.round(l.y) - 9);
        }
      });
      ctx!.globalAlpha = 1;
    }

    let raf = 0;
    let visible = true;
    const loop = () => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      draw(dt);
      raf = requestAnimationFrame(loop);
    };
    const play = () => {
      if (reduced || raf || !visible || document.hidden) return;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();
    if (reduced) draw(0);

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) play();
      else stop();
    });
    io.observe(el);
    const onVis = () => (document.hidden ? stop() : play());
    document.addEventListener("visibilitychange", onVis);

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        progress = self.progress;
        if (reduced) draw(0);
      },
    });

    const move = (e: PointerEvent) => {
      pointerX = e.clientX - el.getBoundingClientRect().left;
    };
    const leave = () => {
      pointerX = null;
      lensBlock = 5;
    };
    if (fine && !reduced) {
      el.addEventListener("pointermove", move);
      el.addEventListener("pointerleave", leave);
    }
    document.fonts?.ready.then(() => reduced && draw(0));

    return () => {
      stop();
      ro.disconnect();
      io.disconnect();
      st.kill();
      document.removeEventListener("visibilitychange", onVis);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [seed, pulses]);

  return (
    <div ref={wrap} aria-hidden="true" className={cn("absolute inset-0", className)}>
      <canvas ref={cvs} className="block h-full w-full" />
    </div>
  );
}
