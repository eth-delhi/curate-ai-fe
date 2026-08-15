"use client";

/* =============================================================================
 * Shared brutalist primitives for the monochrome landing + auth surfaces.
 * Ink #0A0A0A on paper #F5F4F0. Reused across the hero, the problem section and
 * the sign-in screen so every surface shares one focal element and one dust
 * field. Respects prefers-reduced-motion via the `still` prop.
 * ========================================================================== */

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export const INK = "#0A0A0A";
export const PAPER = "#F5F4F0";
export const EXPO = [0.16, 1, 0.3, 1] as const;
export const display = "font-[family-name:var(--font-archivo)]";

// ---------------------------------------------------------------------------
// Ambient dust — one fixed layer for the whole page, so the specks drift
// uninterrupted across every section instead of restarting.
// ---------------------------------------------------------------------------
const DOTS = [
  { top: "14%", left: "12%", d: 11 },
  { top: "22%", left: "78%", d: 13 },
  { top: "34%", left: "44%", d: 10 },
  { top: "41%", left: "88%", d: 14 },
  { top: "56%", left: "8%", d: 12 },
  { top: "63%", left: "60%", d: 11 },
  { top: "70%", left: "30%", d: 13 },
  { top: "78%", left: "84%", d: 10 },
  { top: "85%", left: "18%", d: 12 },
  { top: "48%", left: "72%", d: 14 },
  { top: "30%", left: "24%", d: 12 },
  { top: "90%", left: "52%", d: 11 },
];

export function AmbientDots({ still }: { still: boolean }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden>
      {DOTS.map((p, i) => (
        <motion.span
          key={i}
          className="absolute h-[3px] w-[3px] rounded-full"
          style={{ top: p.top, left: p.left, backgroundColor: INK, opacity: 0.45 }}
          animate={still ? undefined : { y: [0, -10, 0], x: [0, 6, 0] }}
          transition={
            still
              ? undefined
              : { duration: p.d, repeat: Infinity, ease: "easeInOut", delay: i * 0.5 }
          }
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Tooltip — pure-CSS brutalist tooltip (ink box, paper text, sharp, hard
// offset). Wraps a trigger; the wrapper owns the hover so it still shows over a
// disabled/aria-disabled control. Renders children as-is when `label` is empty.
// ---------------------------------------------------------------------------
export function Tooltip({
  label,
  children,
  side = "top",
  className = "",
}: {
  label?: string | null;
  children: ReactNode;
  side?: "top" | "bottom";
  className?: string;
}) {
  if (!label) return <>{children}</>;
  const pos = side === "bottom" ? "top-full mt-2" : "bottom-full mb-2";
  return (
    <span className={`group/tt relative inline-flex ${className}`}>
      {children}
      <span
        role="tooltip"
        className={`pointer-events-none absolute left-1/2 z-[9998] ${pos} w-max max-w-[220px] -translate-x-1/2 whitespace-normal border border-[#0A0A0A] bg-[#0A0A0A] px-2.5 py-1.5 text-center text-[10px] font-bold uppercase leading-snug tracking-[0.12em] text-[#F5F4F0] opacity-0 shadow-[3px_3px_0_0_rgba(10,10,10,0.18)] transition-opacity duration-150 group-hover/tt:opacity-100`}
      >
        {label}
      </span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Custom cursor — small ink dot, swells over interactive targets.
// ---------------------------------------------------------------------------
export function CustomCursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const sx = useSpring(x, { stiffness: 600, damping: 40, mass: 0.35 });
  const sy = useSpring(y, { stiffness: 600, damping: 40, mass: 0.35 });
  const [big, setBig] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
    };
    const over = (e: MouseEvent) => {
      const el = e.target as HTMLElement | null;
      setBig(!!el?.closest("a, button, [data-cursor]"));
    };
    window.addEventListener("mousemove", move, { passive: true });
    window.addEventListener("mouseover", over, { passive: true });
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseover", over);
    };
  }, [x, y]);

  return (
    <motion.div
      style={{ translateX: sx, translateY: sy }}
      className="pointer-events-none fixed left-0 top-0 z-[10000]"
      aria-hidden
    >
      <motion.div
        animate={{ scale: big ? 2.7 : 1 }}
        transition={{ type: "spring", stiffness: 400, damping: 28 }}
        className="-ml-[5px] -mt-[5px] h-2.5 w-2.5 rounded-full"
        style={{ backgroundColor: INK }}
      />
    </motion.div>
  );
}

// ---------------------------------------------------------------------------
// Focal element — generative ink-stipple neural cloud on Canvas 2D. Fills its
// parent; center-weighted so it reads as one soft mass. `still` paints one
// settled frame (reduced motion / low power) instead of looping.
// ---------------------------------------------------------------------------
export function NeuralCloud({ still }: { still: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let alive = true;
    const AMP = 7;

    const lowPower =
      (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 640;
    const N = still ? 3000 : lowPower ? 1800 : 3400;

    type P = {
      bx: number;
      by: number;
      x: number;
      y: number;
      a: number;
      s: number;
      ph: number;
    };
    let parts: P[] = [];
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const seed = () => {
      parts = [];
      const cx = w * 0.55;
      const cy = h * 0.49;
      const R = Math.min(w, h) * 0.4;
      for (let i = 0; i < N; i++) {
        const nr = Math.pow(Math.random(), 1.3);
        const ang = Math.random() * Math.PI * 2;
        const lump = 1 + 0.22 * Math.sin(ang * 3 + i * 0.0007);
        const rr = nr * R * lump;
        parts.push({
          bx: cx + Math.cos(ang) * rr,
          by: cy + Math.sin(ang) * rr * 0.94,
          x: cx,
          y: cy,
          a: (1 - nr) * 0.55 + 0.2,
          s: 1.1 + (1 - nr) * 0.7,
          ph: Math.random() * Math.PI * 2,
        });
      }
    };

    resize();
    seed();

    let t = 0;
    const draw = () => {
      t += 0.005;
      ctx.clearRect(0, 0, w, h);
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const off = 0.02;
      ctx.fillStyle = INK;
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i];
        const fx =
          Math.sin(p.by * 0.008 + t * 1.2 + p.ph) +
          Math.cos(p.bx * 0.006 - t * 0.9);
        const fy =
          Math.cos(p.bx * 0.008 - t * 1.0 + p.ph) +
          Math.sin(p.by * 0.006 + t * 1.1);
        p.x += (p.bx + fx * AMP - p.x) * 0.08;
        p.y += (p.by + fy * AMP - p.y) * 0.08;
        ctx.globalAlpha = p.a;
        ctx.fillRect(p.x - mouse.x * off, p.y - mouse.y * off, p.s, p.s);
      }
      ctx.globalAlpha = 1;
      if (alive && !still) raf = requestAnimationFrame(draw);
    };

    if (still) {
      for (let k = 0; k < 120; k++) {
        t += 0.005;
        for (let i = 0; i < parts.length; i++) {
          const p = parts[i];
          const fx =
            Math.sin(p.by * 0.008 + t * 1.2 + p.ph) +
            Math.cos(p.bx * 0.006 - t * 0.9);
          const fy =
            Math.cos(p.bx * 0.008 - t * 1.0 + p.ph) +
            Math.sin(p.by * 0.006 + t * 1.1);
          p.x += (p.bx + fx * AMP - p.x) * 0.08;
          p.y += (p.by + fy * AMP - p.y) * 0.08;
        }
      }
      draw();
    } else {
      raf = requestAnimationFrame(draw);
    }

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.tx = e.clientX - r.left - w / 2;
      mouse.ty = e.clientY - r.top - h / 2;
    };
    const onResize = () => {
      resize();
      seed();
      if (still) draw();
    };
    if (!still) window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [still]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}

// ---------------------------------------------------------------------------
// Particle birds — a loose flock rendered in the SAME ink-stipple language as
// NeuralCloud (Canvas 2D, INK fillRects at varying alpha). At rest the flock is
// a barely-there dust cluster near the hero baseline — one more ambient
// formation. As the hero scrolls the particles cohere into pigeon silhouettes
// and lift up-and-right through the neural cloud along a scroll-scrubbed bezier;
// scrolling back retraces the path and loosens them into the resting cluster
// again. Fully reversible, tied 1:1 to scroll. `still` (reduced motion / low
// power) paints only the settled resting cluster, no flight.
// ---------------------------------------------------------------------------
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// One pigeon-in-flight silhouette as a local-space point cloud: x is wingspan
// (-1..1), y is head(-)→tail(+). Density implies the form — no outline. Outer
// wing carries a `wing` weight that drives the density-shift "wingbeat".
type BirdPoint = { x: number; y: number; wing: number; a: number; s: number };
function buildBird(): BirdPoint[] {
  const R = Math.random;
  const pts: BirdPoint[] = [];
  // plump body — the dense core mass
  for (let i = 0; i < 44; i++) {
    const r = Math.pow(R(), 0.65);
    const ang = R() * Math.PI * 2;
    pts.push({ x: Math.cos(ang) * 0.11 * r, y: Math.sin(ang) * 0.2 * r, wing: 0, a: 0.52, s: 1.5 });
  }
  // head — small bump forward (up)
  for (let i = 0; i < 16; i++) {
    const r = Math.pow(R(), 0.6);
    const ang = R() * Math.PI * 2;
    pts.push({ x: Math.cos(ang) * 0.08 * r, y: -0.22 + Math.sin(ang) * 0.09 * r, wing: 0, a: 0.54, s: 1.4 });
  }
  // wings — broad, shallow, wide span (pigeon, not gull); outer third beats
  for (const side of [-1, 1]) {
    const Sx = side * 0.08, Sy = -0.05; // shoulder
    const Cx = side * 0.5, Cy = -0.17; // gentle camber
    const Tx = side * 1.0, Ty = 0.02; // tip, near-level & wide
    for (let i = 0; i < 64; i++) {
      const u = Math.pow(R(), 1.1);
      const iu = 1 - u;
      const mx = iu * iu * Sx + 2 * iu * u * Cx + u * u * Tx;
      const my = iu * iu * Sy + 2 * iu * u * Cy + u * u * Ty;
      const dx = 2 * iu * (Cx - Sx) + 2 * u * (Tx - Cx);
      const dy = 2 * iu * (Cy - Sy) + 2 * u * (Ty - Cy);
      const dl = Math.hypot(dx, dy) || 1;
      const chord = 0.3 * Math.pow(1 - u, 0.6) + 0.03; // broad at base, tapered tip
      const v = R() - 0.5;
      pts.push({
        x: mx + (-dy / dl) * v * chord,
        y: my + (dx / dl) * v * chord,
        wing: smooth(0.35, 0.98, u),
        a: 0.48 - u * 0.14,
        s: 1.4 - u * 0.3,
      });
    }
  }
  // short fanned tail — compact, so it never becomes a fourth spoke
  for (let i = 0; i < 22; i++) {
    const u = R();
    const hw = 0.03 + u * 0.1;
    pts.push({ x: (R() * 2 - 1) * hw, y: 0.16 + u * 0.16, wing: 0, a: 0.44 - u * 0.12, s: 1.35 - u * 0.2 });
  }
  return pts;
}

// Per-bird flight: a cubic bezier from the resting anchor (rest) up through the
// cloud to an off-top exit, with staggered start (delay) and independent
// trajectory/scale/beat so the flock never moves as one rigid unit. Fractions
// of the hero box; y<0 exits above.
type BirdDef = {
  delay: number;
  scale: number;
  beats: number;
  beatPh: number;
  rest: [number, number];
  c1: [number, number];
  c2: [number, number];
  exit: [number, number];
};
const BIRD_DEFS: BirdDef[] = [
  { delay: 0.0, scale: 1.02, beats: 2.2, beatPh: 0.0, rest: [0.31, 0.85], c1: [0.4, 0.58], c2: [0.6, 0.24], exit: [0.66, -0.15] },
  { delay: 0.06, scale: 0.84, beats: 2.6, beatPh: 1.7, rest: [0.39, 0.82], c1: [0.46, 0.62], c2: [0.66, 0.28], exit: [0.76, -0.12] },
  { delay: 0.11, scale: 0.93, beats: 2.0, beatPh: 3.1, rest: [0.46, 0.87], c1: [0.5, 0.6], c2: [0.58, 0.22], exit: [0.56, -0.16] },
];
const BIRD_SCALE = 56; // px per local unit → ~112px wingspan at scale 1

export function ParticleBirds({ still }: { still: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0;
    let h = 0;
    let raf = 0;
    let alive = true;
    let onScreen = true;

    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 640;
    const defs = BIRD_DEFS.slice(0, lowPower ? 2 : 3);
    const sMul = lowPower ? 0.82 : 1;

    type BP = {
      lx: number; ly: number; wing: number; ba: number; s: number; // template
      rox: number; roy: number; // resting scatter offset (px)
      x: number; y: number; ph: number; // live
    };
    type Bird = { def: BirdDef; parts: BP[] };
    let birds: Bird[] = [];

    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width;
      h = r.height;
      canvas.width = Math.max(1, Math.floor(w * dpr));
      canvas.height = Math.max(1, Math.floor(h * dpr));
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const gauss = () => (Math.random() + Math.random() + Math.random()) / 1.5 - 1; // ~[-1,1]
    const seed = () => {
      birds = defs.map((def) => {
        const tpl = buildBird();
        const p0x = w * def.rest[0];
        const p0y = h * def.rest[1];
        const parts: BP[] = tpl.map((p) => {
          const rox = gauss() * 56;
          const roy = gauss() * 32;
          return { lx: p.x, ly: p.y, wing: p.wing, ba: p.a, s: p.s * sMul, rox, roy, x: p0x + rox, y: p0y + roy, ph: Math.random() * Math.PI * 2 };
        });
        return { def, parts };
      });
    };

    resize();
    seed();

    // scroll progress 0..1 from the hero box crossing the viewport
    const progress = () => {
      const r = host.getBoundingClientRect();
      return clamp01(-r.top / (r.height * 0.9 || 1));
    };

    let t = 0;
    const step = (p: number, follow: number) => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = INK;
      for (let bi = 0; bi < birds.length; bi++) {
        const { def, parts } = birds[bi];
        const pi = clamp01((p - def.delay) / (1 - def.delay));
        const c = smooth(0, 0.14, pi); // coherence: loose → formed
        const ft = smooth(0.12, 1, pi); // flight progress along bezier
        // bezier anchor + tangent (px)
        const P0x = w * def.rest[0], P0y = h * def.rest[1];
        const P1x = w * def.c1[0], P1y = h * def.c1[1];
        const P2x = w * def.c2[0], P2y = h * def.c2[1];
        const P3x = w * def.exit[0], P3y = h * def.exit[1];
        const it = 1 - ft;
        const ax = it * it * it * P0x + 3 * it * it * ft * P1x + 3 * it * ft * ft * P2x + ft * ft * ft * P3x;
        const ay = it * it * it * P0y + 3 * it * it * ft * P1y + 3 * it * ft * ft * P2y + ft * ft * ft * P3y;
        const tx = 3 * it * it * (P1x - P0x) + 6 * it * ft * (P2x - P1x) + 3 * ft * ft * (P3x - P2x);
        const ty = 3 * it * it * (P1y - P0y) + 6 * it * ft * (P2y - P1y) + 3 * ft * ft * (P3y - P2y);
        // gentle heading: align "up" of the silhouette to the flight tangent
        let th = (Math.atan2(ty, tx) + Math.PI / 2) * 0.55 * c;
        th = th < -0.5 ? -0.5 : th > 0.5 ? 0.5 : th;
        const cs = Math.cos(th), sn = Math.sin(th), S = def.scale * BIRD_SCALE;
        const wingPhase = ft * def.beats * Math.PI * 2 + def.beatPh;
        for (let i = 0; i < parts.length; i++) {
          const pt = parts[i];
          // density-shift "wingbeat": a traveling thin/thicken wave along the wing
          const wv = Math.sin(wingPhase - pt.wing * 1.3);
          const wingMul = pt.wing > 0 ? 0.55 + 0.45 * (0.5 + 0.5 * wv) : 1;
          const ly = pt.ly + pt.wing * wv * 0.03; // tiny wingtip bob
          const fx = ax + (pt.lx * cs - ly * sn) * S;
          const fy = ay + (pt.lx * sn + ly * cs) * S;
          const targetX = lerp(P0x + pt.rox, fx, c);
          const targetY = lerp(P0y + pt.roy, fy, c);
          const j = t * 0.9 + pt.ph;
          pt.x += (targetX + Math.sin(j) * 1.1 - pt.x) * follow;
          pt.y += (targetY + Math.cos(j * 1.1) * 1.1 - pt.y) * follow;
          ctx.globalAlpha = lerp(0.22, pt.ba, c) * wingMul;
          ctx.fillRect(pt.x, pt.y, pt.s, pt.s);
        }
      }
      ctx.globalAlpha = 1;
    };

    const draw = () => {
      t += 0.016;
      step(progress(), 0.14);
      if (alive && onScreen) raf = requestAnimationFrame(draw);
    };

    if (still) {
      // settle the resting cluster, paint one frame, no flight/loop
      for (let k = 0; k < 60; k++) {
        t += 0.016;
        step(0, 0.2);
      }
    } else {
      raf = requestAnimationFrame(draw);
    }

    const onResize = () => {
      resize();
      seed();
      if (still) step(0, 1);
    };
    window.addEventListener("resize", onResize);

    // pause the loop while the hero is offscreen
    const io = still
      ? null
      : new IntersectionObserver(
          ([e]) => {
            onScreen = e.isIntersecting;
            if (onScreen && alive) raf = requestAnimationFrame(draw);
          },
          { threshold: 0 }
        );
    io?.observe(host);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  }, [still]);

  return <canvas ref={canvasRef} className="h-full w-full" aria-hidden />;
}

// ---------------------------------------------------------------------------
// Cloud → rain → globe — a scroll-scrubbed particle sequence in the SAME ink-
// stipple language. Raw information (a soft dot-cloud) streams downward (rain)
// and reassembles into a slowly-spinning dot-globe whose continents read as
// denser dot masses against a sparse ocean field. Scroll drives materialization
// only; the spin is an independent idle loop (~40s). Fully reversible on
// scroll-up. `still` (reduced motion) paints the formed globe, no cloud/rain.
// ---------------------------------------------------------------------------

// Very simplified continent outlines as [lng, lat] polygons — coarse on
// purpose: at this stipple density the goal is denser dot masses reading as
// land, not cartographic accuracy.
const CONTINENTS: number[][][] = [
  // North America
  [[-165, 60], [-160, 70], [-140, 71], [-120, 71], [-95, 72], [-80, 68], [-60, 60], [-55, 50], [-65, 45], [-70, 41], [-75, 35], [-81, 25], [-97, 18], [-106, 21], [-115, 30], [-124, 40], [-128, 48], [-135, 57], [-150, 60], [-165, 60]],
  // Greenland
  [[-45, 60], [-28, 60], [-18, 70], [-30, 80], [-45, 82], [-58, 78], [-56, 68], [-45, 60]],
  // South America
  [[-80, 8], [-70, 10], [-60, 5], [-50, 0], [-40, -6], [-35, -9], [-40, -20], [-48, -26], [-58, -35], [-66, -45], [-73, -52], [-75, -45], [-72, -33], [-70, -18], [-76, -12], [-81, -4], [-80, 8]],
  // Africa
  [[-16, 15], [-8, 25], [0, 32], [10, 34], [22, 32], [32, 31], [43, 12], [51, 11], [42, -2], [40, -14], [34, -25], [25, -34], [17, -34], [12, -16], [8, 5], [-4, 6], [-11, 10], [-16, 15]],
  // Europe
  [[-10, 43], [-9, 38], [0, 40], [5, 43], [12, 45], [20, 42], [28, 41], [30, 47], [30, 56], [24, 60], [18, 66], [10, 62], [4, 58], [-3, 52], [-6, 50], [-10, 43]],
  // Asia
  [[30, 47], [45, 43], [55, 40], [60, 25], [68, 25], [77, 8], [82, 13], [90, 22], [100, 8], [106, 11], [110, 20], [120, 33], [122, 41], [132, 44], [142, 51], [150, 60], [163, 62], [178, 67], [170, 72], [140, 74], [110, 75], [80, 76], [58, 70], [45, 66], [38, 56], [32, 51], [30, 47]],
  // Australia
  [[114, -22], [122, -18], [131, -12], [138, -12], [145, -15], [150, -24], [153, -29], [149, -38], [140, -38], [130, -32], [120, -34], [114, -30], [114, -22]],
];

function inPoly(x: number, y: number, poly: number[][]) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

type GlobePt = { ux: number; uy: number; uz: number; cont: boolean; ga: number; gs: number };
function makeGlobePt(lat: number, lng: number, cont: boolean): GlobePt {
  const la = (lat * Math.PI) / 180, lo = (lng * Math.PI) / 180;
  const cl = Math.cos(la);
  return {
    ux: cl * Math.sin(lo),
    uy: Math.sin(la),
    uz: cl * Math.cos(lo),
    cont,
    ga: cont ? 0.55 + Math.random() * 0.18 : 0.2 + Math.random() * 0.12,
    gs: cont ? 1.5 + Math.random() * 0.5 : 1.1 + Math.random() * 0.3,
  };
}
function buildGlobePts(N: number): GlobePt[] {
  const isLand = (lat: number, lng: number) => CONTINENTS.some((pl) => inPoly(lng, lat, pl));
  const pts: GlobePt[] = [];
  const landTarget = Math.round(N * 0.6);
  let tries = 0;
  while (pts.length < landTarget && tries < landTarget * 60) {
    tries++;
    const lat = (Math.asin(Math.random() * 2 - 1) * 180) / Math.PI;
    const lng = Math.random() * 360 - 180;
    if (isLand(lat, lng)) pts.push(makeGlobePt(lat, lng, true));
  }
  let ot = 0;
  const oceanTarget = N;
  while (pts.length < oceanTarget && ot < oceanTarget * 40) {
    ot++;
    const lat = (Math.asin(Math.random() * 2 - 1) * 180) / Math.PI;
    const lng = Math.random() * 360 - 180;
    if (!isLand(lat, lng)) pts.push(makeGlobePt(lat, lng, false));
  }
  return pts;
}

export function CloudGlobe({ still }: { still: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let vw = 0, vh = 0, raf = 0, alive = true, running = false;

    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 640;
    const N = lowPower ? 1050 : 1700;
    const SPIN = (Math.PI * 2) / 40; // rad per second — one idle turn / 40s
    const TILT = 0.34;
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

    // Viewport-relative anchors: the cloud sits where hero-one's focal cloud was,
    // the globe forms in section-two's right zone. Same x on desktop so the cloud
    // rains straight down into the globe.
    let cloudX = 0, cloudY = 0, Rc = 0, globeX = 0, globeY = 0, Rg = 0;
    const layout = () => {
      const mob = vw < 640;
      // cloud sits above the globe so the rain only ever falls (never rises) in
      cloudX = vw * (mob ? 0.55 : 0.68);
      cloudY = vh * (mob ? 0.42 : 0.42);
      Rc = Math.min(vw, vh) * (mob ? 0.32 : 0.28);
      globeX = vw * (mob ? 0.5 : 0.68);
      globeY = vh * (mob ? 0.62 : 0.58);
      Rg = (mob ? vw * 0.33 : vh * 0.3);
    };

    type Part = GlobePt & {
      cx: number; cy: number; ca: number; cs: number; ph: number;
      fs: number; // fall start (progress)
      x: number; y: number;
    };
    let globePts: GlobePt[] | null = null;
    let parts: Part[] = [];

    const resize = () => {
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(vw * dpr));
      canvas.height = Math.max(1, Math.floor(vh * dpr));
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };

    const seed = () => {
      if (!globePts) globePts = buildGlobePts(N);
      parts = globePts.map((g) => {
        const nr = Math.pow(Math.random(), 1.3);
        const ang = Math.random() * Math.PI * 2;
        const rr = nr * Rc * (1 + 0.2 * Math.sin(ang * 3));
        const cx = cloudX + Math.cos(ang) * rr;
        // bias cloud height by eventual globe latitude, so each dot falls (never
        // rises) into place and the globe assembles cleanly top-down
        const cy = cloudY + Math.sin(ang) * rr * 0.5 - g.uy * Rc * 0.55;
        return {
          ...g,
          cx, cy,
          ca: (1 - nr) * 0.4 + 0.16,
          cs: 1.1 + (1 - nr) * 0.6,
          ph: Math.random() * Math.PI * 2,
          fs: Math.random() * 0.06, // detaches into rain as soon as scroll begins
          x: cx, y: cy,
        };
      });
    };

    resize();
    seed();

    // Page-scroll → sequence progress + layer opacity (all in viewport heights).
    // Cloud holds through the hero, then rains + globes as section two scrolls.
    const scrollP = () => clamp01(window.scrollY / (1.3 * vh));
    const liveOpacity = () => 1 - clamp01((window.scrollY - 1.55 * vh) / (0.45 * vh));
    // Reduced-motion: globe only, fading in over section two (no cloud/rain here —
    // the hero keeps its static NeuralCloud in that mode).
    const stillOpacity = () =>
      clamp01((window.scrollY - 0.7 * vh) / (0.5 * vh)) -
      clamp01((window.scrollY - 1.6 * vh) / (0.4 * vh));

    const step = (p: number, follow: number, spinA: number, t: number) => {
      ctx.clearRect(0, 0, vw, vh);
      ctx.fillStyle = INK;
      const cosA = Math.cos(spinA), sinA = Math.sin(spinA);
      const cosP = Math.cos(TILT), sinP = Math.sin(TILT);
      mouse.x += (mouse.tx - mouse.x) * 0.06;
      mouse.y += (mouse.ty - mouse.y) * 0.06;
      const fallRate = (globeY + Rg - cloudY) / 0.66; // px of fall per unit progress
      const cap = vh * 0.12; // px window over which a landed dot gathers into the sphere
      for (let i = 0; i < parts.length; i++) {
        const pt = parts[i];
        // globe target (spinning)
        const x1 = pt.ux * cosA + pt.uz * sinA;
        const z1 = -pt.ux * sinA + pt.uz * cosA;
        const y2 = pt.uy * cosP - z1 * sinP;
        const z2 = pt.uy * sinP + z1 * cosP;
        const gx = globeX + x1 * Rg;
        const gy = globeY - y2 * Rg;
        const front = z2 * 0.5 + 0.5; // 0 back → 1 front
        // constant-rate fall from the cloud; swirl + parallax fade as it detaches
        const fallP = Math.max(0, p - pt.fs);
        const fallen = fallP * fallRate;
        const cw = 1 - clamp01(fallP / 0.12);
        const fx = Math.sin(pt.cy * 0.008 + t + pt.ph) + Math.cos(pt.cx * 0.006 - t * 0.8);
        const fy = Math.cos(pt.cx * 0.008 - t + pt.ph) + Math.sin(pt.cy * 0.006 + t * 0.9);
        const cxs = pt.cx + (fx * 6 - mouse.x * 0.015) * cw;
        const cys = pt.cy + (fy * 6) * cw;
        // rain streams straight down, clamped so it never falls past its globe row
        const need = Math.max(1, gy - cys);
        const rainX = cxs + (gx - cxs) * 0.14 * clamp01(fallen / need);
        const rainY = Math.min(cys + fallen, gy);
        // once the fall reaches that row, gather horizontally into the sphere
        const m = clamp01((cys + fallen - gy) / cap);
        const tx = lerp(rainX, gx, m);
        const ty = lerp(rainY, gy, m);
        const gA = pt.ga * (0.3 + 0.7 * front);
        const gS = pt.gs * (0.72 + 0.42 * front);
        const rainA = pt.ca * (1 - 0.35 * clamp01(fallen / (cap * 2)));
        const a = lerp(rainA, gA, m);
        const s = lerp(pt.cs, gS, m);
        pt.x += (tx - pt.x) * follow;
        pt.y += (ty - pt.y) * follow;
        ctx.globalAlpha = a;
        ctx.fillRect(pt.x, pt.y, s, s);
      }
      ctx.globalAlpha = 1;
    };

    let t = 0;
    const draw = () => {
      const op = liveOpacity();
      canvas.style.opacity = String(op);
      if (op <= 0.001) { running = false; return; } // idle while scrolled past — scroll wakes it
      t += 0.01;
      step(scrollP(), 0.18, (performance.now() / 1000) * SPIN, t);
      if (alive) raf = requestAnimationFrame(draw);
    };
    const start = () => { if (!running && alive) { running = true; raf = requestAnimationFrame(draw); } };

    if (still) {
      const paint = () => { canvas.style.opacity = String(stillOpacity()); step(1, 1, 0.7, 0); };
      paint();
      const onScroll = () => paint();
      const onR = () => { resize(); seed(); paint(); };
      window.addEventListener("scroll", onScroll, { passive: true });
      window.addEventListener("resize", onR);
      return () => {
        window.removeEventListener("scroll", onScroll);
        window.removeEventListener("resize", onR);
      };
    }

    start();
    const onScroll = () => start();
    const onMove = (e: MouseEvent) => { mouse.tx = e.clientX - cloudX; mouse.ty = e.clientY - cloudY; };
    const onResize = () => { resize(); seed(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("resize", onResize);
    };
  }, [still]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[1] h-full w-full" aria-hidden />;
}
