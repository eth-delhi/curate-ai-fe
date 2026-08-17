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

// Every section's content sits in a centered max-w-[1600px] container (see
// SiteNav/Hero/SignalSection). Canvas anchors that used raw viewport-width
// fractions bled off past the nav/text on wide/ultrawide screens once vw grew
// past 1600 — this maps a 0..1 fraction onto that same centered container
// instead, so canvas elements never drift past where the text actually ends.
export function containerX(vw: number, frac: number) {
  const w = Math.min(vw, 1600);
  const left = (vw - w) / 2;
  return left + w * frac;
}

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
    // Progress tracks the OUTER pinned hero section, not this canvas's own
    // (sticky, scroll-frozen) immediate parent — otherwise, once the hero
    // became a tall scroll-scrubbed track, this would never see its host's
    // top move and would appear frozen.
    const section = (host.closest("[data-hero]") as HTMLElement | null) ?? host;

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

    // scroll progress 0..1 from the outer hero section crossing the viewport
    const progress = () => {
      const r = section.getBoundingClientRect();
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

export type GlobePt = { ux: number; uy: number; uz: number; cont: boolean; ga: number; gs: number };
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
export function buildGlobePts(N: number): GlobePt[] {
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

// ---------------------------------------------------------------------------
// Data-transfer arcs — a few great-circle routes between real-world hub
// coordinates, rendered as a faint static dotted path plus small "packet"
// dots that loop along it with a short comet trail. Drawn with the exact same
// spin/tilt projection and front/back dimming as the globe's dust, so they
// read as part of the same object rather than an overlay. Only appears once
// the globe has fully formed (gated on scroll progress), never during the
// rain/formation stages.
// ---------------------------------------------------------------------------
export function vec3(lat: number, lng: number) {
  const la = (lat * Math.PI) / 180, lo = (lng * Math.PI) / 180;
  const cl = Math.cos(la);
  return { x: cl * Math.sin(lo), y: Math.sin(la), z: cl * Math.cos(lo) };
}
export function slerp3(a: { x: number; y: number; z: number }, b: { x: number; y: number; z: number }, t: number) {
  const dot = Math.min(1, Math.max(-1, a.x * b.x + a.y * b.y + a.z * b.z));
  const omega = Math.acos(dot);
  if (omega < 1e-6) return a;
  const s = Math.sin(omega);
  const wa = Math.sin((1 - t) * omega) / s;
  const wb = Math.sin(t * omega) / s;
  return { x: a.x * wa + b.x * wb, y: a.y * wa + b.y * wb, z: a.z * wa + b.z * wb };
}
// Real hub coordinates, chosen to land inside the CONTINENTS masses above.
export const ARC_HUBS = {
  ny: vec3(40.7, -74),
  london: vec3(51.5, -0.1),
  beijing: vec3(39.9, 116.4),
  saopaulo: vec3(-23.5, -46.6),
  lagos: vec3(6.5, 3.4),
};
export const ARC_ROUTES = [
  [ARC_HUBS.ny, ARC_HUBS.london],
  [ARC_HUBS.london, ARC_HUBS.beijing],
  [ARC_HUBS.saopaulo, ARC_HUBS.lagos],
] as const;
export const ARC_LIFT = 0.16; // arcs bulge gently outside the globe's radius, like a flight path
export function arcPoint(route: readonly [{ x: number; y: number; z: number }, { x: number; y: number; z: number }], t: number) {
  const p = slerp3(route[0], route[1], t);
  const lift = 1 + ARC_LIFT * Math.sin(Math.PI * t);
  return { x: p.x * lift, y: p.y * lift, z: p.z * lift };
}
export const ARC_ROUTE_SAMPLES = 40;
export const ARC_CLUSTERS = 4; // simultaneous data-transfer bursts in flight per route
export const ARC_CLUSTER_DOTS = 6; // dots bunched into each burst
export const ARC_CLUSTER_SPREAD = 0.02; // how tightly a burst's dots bunch (route fraction) — cluster, not a trail
export const ARC_SPEED = 0.34; // fraction of the route travelled per t-unit — fast, visible transfer

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

    // The hero's own portrait now provides the "cloud" (it disintegrates into
    // rain on its own WebGL layer); this canvas only ever receives falling
    // rain and forms it into the globe — no resting cloud shape here anymore.
    // rainSrcX/Y anchor the top of that incoming rain column; kept roughly
    // under where the hero portrait sits so the fall reads as one column.
    let rainSrcX = 0, rainSrcY = 0, Rc = 0, globeX = 0, globeY = 0, Rg = 0;
    const layout = () => {
      const mob = vw < 640;
      rainSrcX = containerX(vw, mob ? 0.55 : 0.68);
      rainSrcY = -vh * 0.15; // just above the viewport — rain is always "already falling"
      Rc = Math.min(vw, vh) * (mob ? 0.32 : 0.28);
      globeX = containerX(vw, mob ? 0.5 : 0.68);
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

    // Static route dot-paths for the data-transfer arcs (geometry only; screen
    // position is reprojected every frame as the globe spins).
    const arcPaths = ARC_ROUTES.map((route) =>
      Array.from({ length: ARC_ROUTE_SAMPLES }, (_, i) => arcPoint(route, i / (ARC_ROUTE_SAMPLES - 1)))
    );

    const resize = () => {
      vw = window.innerWidth; vh = window.innerHeight;
      canvas.width = Math.max(1, Math.floor(vw * dpr));
      canvas.height = Math.max(1, Math.floor(vh * dpr));
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };

    // Widest a particle's entry point sits above rainSrcY — used both to seed
    // the stagger and (below) to size the fall rate so even the highest
    // starting particle comfortably completes its fall in time.
    const ABOVE_SPREAD = () => vh * 0.35 + Rc * 0.4;

    const seed = () => {
      if (!globePts) globePts = buildGlobePts(N);
      const above = ABOVE_SPREAD();
      parts = globePts.map((g) => {
        const nr = Math.pow(Math.random(), 1.3);
        const ang = Math.random() * Math.PI * 2;
        const rr = Math.random() * Rc * 0.9;
        const cx = rainSrcX + Math.cos(ang) * rr;
        // staggered entry height above the viewport, biased by eventual globe
        // latitude so it still falls in a roughly straight column
        const cy = rainSrcY - Math.random() * above - g.uy * Rc * 0.4;
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

    // Progress is relative to the HERO's own rendered height (not a hardcoded
    // vh multiple) so this stays in sync regardless of how tall the portrait
    // sequence's scroll track ends up being. The globe section's own timing
    // (in viewport heights) is unchanged, just measured from where the hero
    // actually ends rather than from the top of the page.
    const heroOffset = () => {
      const heroEl = document.querySelector("[data-hero]") as HTMLElement | null;
      return heroEl?.offsetHeight ?? vh;
    };
    const effectiveScrollY = () => Math.max(0, window.scrollY - heroOffset());
    const scrollP = () => clamp01(effectiveScrollY() / (1.3 * vh));
    const liveOpacity = () => 1 - clamp01((effectiveScrollY() - 1.55 * vh) / (0.45 * vh));
    // Reduced-motion: globe only, fading in over section two (no rain here —
    // the hero keeps its own static masked portrait in that mode).
    const stillOpacity = () =>
      clamp01((effectiveScrollY() - 0.7 * vh) / (0.5 * vh)) -
      clamp01((effectiveScrollY() - 1.6 * vh) / (0.4 * vh));

    const step = (p: number, follow: number, spinA: number, t: number) => {
      ctx.clearRect(0, 0, vw, vh);
      ctx.fillStyle = INK;
      const cosA = Math.cos(spinA), sinA = Math.sin(spinA);
      const cosP = Math.cos(TILT), sinP = Math.sin(TILT);
      // fall rate sized off the worst case (highest entry point) so every
      // particle, regardless of its staggered start, comfortably completes
      // its fall well within the progress range
      const fallRate = (globeY + Rg - rainSrcY + ABOVE_SPREAD()) / 0.5;
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
        // constant-rate fall; a small sideways rain-jitter, not a cloud swirl
        const fallP = Math.max(0, p - pt.fs);
        const fallen = fallP * fallRate;
        const cxs = pt.cx + Math.sin(pt.cy * 0.02 + t * 1.4 + pt.ph) * 1.6;
        const cys = pt.cy;
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

      // Data-transfer arcs — only once the globe is essentially fully formed.
      const arcT = smooth(0.88, 1.0, p);
      if (arcT > 0.001) {
        const project = (lp: { x: number; y: number; z: number }) => {
          const x1 = lp.x * cosA + lp.z * sinA;
          const z1 = -lp.x * sinA + lp.z * cosA;
          const y2 = lp.y * cosP - z1 * sinP;
          const z2 = lp.y * sinP + z1 * cosP;
          const front = 0.3 + 0.7 * (z2 * 0.5 + 0.5); // dim (not hide) the far side
          return { sx: globeX + x1 * Rg, sy: globeY - y2 * Rg, front };
        };
        for (let ri = 0; ri < arcPaths.length; ri++) {
          const path = arcPaths[ri];
          for (let i = 0; i < path.length; i++) {
            const { sx, sy, front } = project(path[i]);
            ctx.globalAlpha = arcT * front * 0.14;
            ctx.fillRect(sx, sy, 1, 1);
          }
          if (!still) {
            // Bursts of tightly-bunched dots ("cluster, gap, cluster") rather
            // than a single fading comet — reads as distinct data transfers.
            for (let cl = 0; cl < ARC_CLUSTERS; cl++) {
              const phase = cl / ARC_CLUSTERS;
              const frac = ((t * ARC_SPEED + ri * 0.37 + phase) % 1 + 1) % 1;
              for (let d = 0; d < ARC_CLUSTER_DOTS; d++) {
                const j = ((d * 0.618034) % 1) - 0.5; // deterministic bunch jitter
                const ft = ((frac + j * ARC_CLUSTER_SPREAD) % 1 + 1) % 1;
                const { sx, sy, front } = project(arcPoint(ARC_ROUTES[ri], ft));
                const dotS = 1.9 + (d % 2) * 0.5;
                ctx.globalAlpha = arcT * front * 0.82;
                ctx.fillRect(sx - dotS / 2, sy - dotS / 2, dotS, dotS);
              }
            }
          }
        }
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
    const onResize = () => { resize(); seed(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
    };
  }, [still]);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-[1] h-full w-full" aria-hidden />;
}

// ---------------------------------------------------------------------------
// Whale circle — third particle sequence, in the SAME stipple-dot language,
// making a specific argument: token-weighted voting forms a closed, self-
// dealing ring; three countermeasures break it apart into a distributed
// field. Single centered composition — text lives INSIDE the ring, sandwiched
// between two canvases (back/front) so passing particles can occlude it, and
// a local density-clear zone keeps it legible without a background plate.
// Progress `p` is local to the section's own box (independent of page
// scrollY). Stages:
//   0.00–0.15   rain — particles fall from above (same grammar as the cloud→
//               rain stage) and gather loosely near the ring's future spot
//   0.15–0.40   particles converge into whale silhouettes, a closed inward-
//               facing ring; vote-streams begin circulating between them
//   0.40–0.567  cm1 vote caps — the streams thin to a trickle
//   0.567–0.733 cm2 AI counterweight — an ordered cluster sweeps the ring;
//               whales it passes lose density and definition
//   0.733–0.90  cm3 claps — the ring fully disperses into a distributed field
//   0.90–1.00   the field settles; closing beat holds before the pin releases
// `still` (reduced motion) paints only the settled distributed field, into
// the back canvas only — no text-occlusion drama in that mode.
// ---------------------------------------------------------------------------

// Docker-whale-inspired flat side silhouette: a solid rounded-oval body
// (blunt at both the nose and the tail base — true curves, not faceted
// polygon corners, so it stays smooth and legible at any rotation) with a
// small, distinctly separate triangular fluke swept back off the tail end.
// Belly slightly fuller than the back for a gentle asymmetry. The practical
// equivalent, inside a hand-rolled Canvas2D engine, of tracing a real
// silhouette rather than hand-placing dots — filled by rejection-sampled
// stipple points, fluke via the same inPoly test as the globe's continents.
// Local space: x=+nose … -tail, y=- back / + belly.
const BODY_CX = 0.06, BODY_RX = 0.66;
const BODY_RY_BACK = 0.32, BODY_RY_BELLY = 0.37;
const FLUKE_TRI: number[][] = [
  [-0.48, -0.07], [-0.82, 0.1], [-0.44, 0.18],
];
function inWhale(x: number, y: number) {
  const dx = (x - BODY_CX) / BODY_RX;
  const dy = y / (y < 0 ? BODY_RY_BACK : BODY_RY_BELLY);
  if (dx * dx + dy * dy <= 1) return true;
  return inPoly(x, y, FLUKE_TRI);
}
type WhalePt = { x: number; y: number; a: number; s: number };
function buildWhaleTemplate(n: number): WhalePt[] {
  const pts: WhalePt[] = [];
  let tries = 0;
  while (pts.length < n && tries < n * 50) {
    tries++;
    const x = -0.84 + Math.random() * 1.68;
    const y = -0.36 + Math.random() * 0.76;
    if (inWhale(x, y)) {
      pts.push({ x, y, a: 0.48 + Math.random() * 0.3, s: 1.35 + Math.random() * 0.55 });
    }
  }
  return pts;
}

// Ordered, geometric — concentric evenly-spaced shells, deliberately unlike
// the whale's organic fill. "Structure versus mass."
function buildAiTemplate(n: number) {
  const shells = [0.16, 0.38, 0.6, 0.82, 1.0];
  const per = Math.round(n / shells.length);
  const pts: { x: number; y: number }[] = [];
  shells.forEach((r, si) => {
    for (let k = 0; k < per; k++) {
      const ang = (k / per) * Math.PI * 2 + si * 0.35;
      pts.push({ x: Math.cos(ang) * r, y: Math.sin(ang) * r });
    }
  });
  return pts;
}

const RING_SQUASH = 0.76; // ring viewed at a slight angle, not a flat wheel

export function WhaleCircle({ still }: { still: boolean }) {
  const backRef = useRef<HTMLCanvasElement>(null);
  const frontRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const backCanvas = backRef.current;
    const frontCanvas = frontRef.current;
    const host = backCanvas?.parentElement;
    const section = host?.closest("[data-whale]") as HTMLElement | null;
    if (!backCanvas || !frontCanvas || !host) return;
    const bctx = backCanvas.getContext("2d");
    const fctx = frontCanvas.getContext("2d");
    if (!bctx || !fctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0, raf = 0, alive = true, onScreen = true;

    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 640;
    const WHALE_COUNT = lowPower ? 5 : 6;
    const PTS_PER_WHALE_TARGET = lowPower ? 130 : 210;
    const AI_N = lowPower ? 90 : 160;
    const SPIN = (Math.PI * 2) / 30; // idle ring rotation, ~30s/turn before cm2 slows it

    const whaleTpl = buildWhaleTemplate(PTS_PER_WHALE_TARGET);
    const PTS_PER_WHALE = whaleTpl.length;
    const aiTpl = buildAiTemplate(AI_N);

    // Ring fills most of the viewport, centered — the text zone is the
    // ring's own empty middle, sized off the same radius.
    let ringX = 0, ringY = 0, Rw = 0, whaleLen = 0, boxHW = 0, boxHH = 0;
    const layout = () => {
      ringX = w * 0.5;
      ringY = h * 0.5;
      Rw = Math.min(w, h) * (w < 640 ? 0.42 : 0.46);
      whaleLen = Rw * 0.78;
      boxHW = Rw * 0.5;
      boxHH = Rw * 0.33;
    };

    type Part = {
      tplIdx: number;
      whaleIdx: number;
      rx0: number; ry0: number; // rain start (off-screen above)
      rx1: number; ry1: number; // rain gather point (on-screen, pre-ring)
      dcx: number; dcy: number; // dispersed-field target (cm3)
      dph: number;
      x: number; y: number;
    };
    let parts: Part[] = [];
    type AiPart = { lx: number; ly: number; x: number; y: number };
    let aiParts: AiPart[] = [];

    const sizeCanvas = (c: HTMLCanvasElement) => {
      c.width = Math.max(1, Math.floor(w * dpr));
      c.height = Math.max(1, Math.floor(h * dpr));
      c.style.width = `${w}px`;
      c.style.height = `${h}px`;
    };
    const resize = () => {
      const r = host.getBoundingClientRect();
      w = r.width; h = r.height;
      sizeCanvas(backCanvas);
      sizeCanvas(frontCanvas);
      bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layout();
    };

    const DISPERSE_CLUSTERS = 26;
    const seed = () => {
      parts = [];
      for (let wi = 0; wi < WHALE_COUNT; wi++) {
        for (let ti = 0; ti < PTS_PER_WHALE; ti++) {
          const gatherAng = Math.random() * Math.PI * 2;
          const gatherR = Rw * (0.2 + Math.random() * 0.7);
          const rx1 = ringX + Math.cos(gatherAng) * gatherR;
          const clusterI = Math.floor(Math.random() * DISPERSE_CLUSTERS);
          const cx = w * (0.05 + (clusterI / Math.max(1, DISPERSE_CLUSTERS - 1)) * 0.9);
          const cy = h * (0.72 + Math.random() * 0.1 - 0.05);
          parts.push({
            tplIdx: ti,
            whaleIdx: wi,
            rx0: rx1 + (Math.random() * 2 - 1) * 10,
            ry0: -h * (0.15 + Math.random() * 0.7),
            rx1,
            ry1: ringY + (Math.random() * 2 - 1) * Rw * 0.5,
            dcx: cx + (Math.random() * 2 - 1) * 18,
            dcy: cy + (Math.random() * 2 - 1) * 12,
            dph: Math.random() * Math.PI * 2,
            x: rx1, y: -h * 0.3,
          });
        }
      }
      aiParts = aiTpl.map((p) => ({ lx: p.x, ly: p.y, x: ringX, y: ringY }));
    };

    resize();
    seed();

    // Local progress from this section's own box — independent of what's
    // above it in page flow. 0.85 divisor leaves a cushion of scroll where p
    // stays clamped at 1 (closing beat holds) before the sticky pin releases.
    const progress = () => {
      if (!section) return 0;
      const r = section.getBoundingClientRect();
      const denom = (r.height - window.innerHeight) * 0.85;
      return clamp01(-r.top / (denom > 0 ? denom : 1));
    };

    const whaleBaseAngle = (idx: number) => -Math.PI / 2 + (idx / WHALE_COUNT) * Math.PI * 2;
    const AI_ENTRY = -Math.PI / 2 - 0.7;
    const AI_SWEEP = 6.6; // generous — comfortably covers every whale angle with margin

    const step = (p: number, follow: number, t: number) => {
      bctx.clearRect(0, 0, w, h);
      fctx.clearRect(0, 0, w, h);
      bctx.fillStyle = INK;
      fctx.fillStyle = INK;

      // Any particle whose current position falls inside the text zone
      // renders on the FRONT canvas (occluding the type); everything else
      // renders on the BACK canvas (behind it) — the density-thin behind
      // text falls out of this routing for free, no separate mask needed.
      const plot = (x: number, y: number, s: number, a: number) => {
        const ctx =
          !still && Math.abs(x - ringX) < boxHW && Math.abs(y - ringY) < boxHH ? fctx : bctx;
        ctx.globalAlpha = a;
        ctx.fillRect(x - s / 2, y - s / 2, s, s);
      };

      const rainT = smooth(0.0, 0.15, p);
      const ringLocal = smooth(0.15, 0.4, p);
      const cm1 = smooth(0.4, 0.567, p);
      const cm2 = smooth(0.567, 0.733, p);
      const cm3 = smooth(0.733, 0.9, p);

      const spinRate = lerp(1, 0.12, cm2);
      const ringA = (performance.now() / 1000) * SPIN * spinRate + 0.06 * Math.sin(t * 4) * cm2;

      for (let i = 0; i < parts.length; i++) {
        const pt = parts[i];
        const tpl = whaleTpl[pt.tplIdx];

        // whale-ring placement — always facing inward, orbiting slowly
        const baseA = whaleBaseAngle(pt.whaleIdx) + ringA;
        const wx = ringX + Math.cos(baseA) * Rw;
        const wy = ringY + Math.sin(baseA) * Rw * RING_SQUASH;
        const inAng = Math.atan2(-Math.sin(baseA) * RING_SQUASH, -Math.cos(baseA));
        const cw = Math.cos(inAng), sw = Math.sin(inAng);
        const lx = tpl.x * whaleLen * 0.5, ly = tpl.y * whaleLen * 0.5;
        const whX = wx + (lx * cw - ly * sw);
        const whY = wy + (lx * sw + ly * cw);

        // stage 0→1: rain falls, gathers loosely, then draws into the ring —
        // one continuous blend, never reversing direction on scroll-up
        const fallY = lerp(pt.ry0, pt.ry1, rainT);
        const fallX = lerp(pt.rx0, pt.rx1, smooth(0, 0.08, rainT));
        let tx = lerp(fallX, whX, ringLocal);
        let ty = lerp(fallY, whY, ringLocal);
        let a = lerp(tpl.a * 0.5, tpl.a, Math.max(rainT * 0.4, ringLocal));
        let s = tpl.s * (0.6 + 0.4 * Math.max(rainT, ringLocal));

        // cm2 — the AI sweep dims/dissolves whales as it passes their angle
        const hit = smooth(
          (whaleBaseAngle(pt.whaleIdx) - AI_ENTRY) / AI_SWEEP - 0.04,
          (whaleBaseAngle(pt.whaleIdx) - AI_ENTRY) / AI_SWEEP + 0.08,
          cm2
        );
        a *= 1 - 0.66 * hit;
        s *= 1 - 0.4 * hit;

        // cm3 — full dispersal into the distributed field
        if (cm3 > 0.001) {
          const j = Math.sin(t * 0.6 + pt.dph) * 3;
          tx = lerp(tx, pt.dcx + j, cm3);
          ty = lerp(ty, pt.dcy, cm3);
          a = lerp(a, 0.18 + 0.18 * ((pt.tplIdx % 5) / 5), cm3);
          s = lerp(s, 1.1 + (pt.tplIdx % 3) * 0.25, cm3);
        }

        pt.x += (tx - pt.x) * follow;
        pt.y += (ty - pt.y) * follow;
        plot(pt.x, pt.y, Math.max(0.6, s), Math.max(0, a));
      }

      // inter-whale vote streams — full strength once the ring forms, thinned
      // by cm1 to "barely a trickle", gone by the time cm2 begins
      const streamAmt = smooth(0.85, 1, ringLocal) * lerp(1, 0.08, cm1) * (1 - smooth(0, 1, cm2));
      if (streamAmt > 0.003) {
        for (let wi = 0; wi < WHALE_COUNT; wi++) {
          const a0 = whaleBaseAngle(wi) + ringA;
          const a1 = whaleBaseAngle(wi + 1) + ringA;
          for (let cl = 0; cl < 3; cl++) {
            const phase = cl / 3;
            const frac = ((t * 0.5 + wi * 0.21 + phase) % 1 + 1) % 1;
            for (let d = 0; d < 4; d++) {
              const j = ((d * 0.618034) % 1 - 0.5) * 0.03;
              const ft = clamp01(frac + j);
              const ang = lerp(a0, a1, ft);
              const rr = Rw * 0.86;
              const sx = ringX + Math.cos(ang) * rr;
              const sy = ringY + Math.sin(ang) * rr * RING_SQUASH;
              plot(sx, sy, 1.6, streamAmt * 0.55);
            }
          }
        }
      }

      // AI counterweight — enters from outside the ring, sweeps across it
      const aiVis = smooth(0.567, 0.61, p) * (1 - smooth(0.7, 0.83, p));
      if (aiVis > 0.003) {
        const aiT = cm2;
        const aiAng = AI_ENTRY + AI_SWEEP * aiT;
        const aiRad = lerp(Rw * 1.55, Rw * 0.12, smooth(0, 1, aiT));
        const aiX = ringX + Math.cos(aiAng) * aiRad;
        const aiY = ringY + Math.sin(aiAng) * aiRad * RING_SQUASH;
        const spin = t * 1.4;
        const cA = Math.cos(spin), sA = Math.sin(spin);
        const aiScale = Rw * 0.13;
        for (let i = 0; i < aiParts.length; i++) {
          const ap = aiParts[i];
          const rx = ap.lx * cA - ap.ly * sA, ry = ap.lx * sA + ap.ly * cA;
          const tx = aiX + rx * aiScale, ty = aiY + ry * aiScale;
          ap.x += (tx - ap.x) * follow;
          ap.y += (ty - ap.y) * follow;
          plot(ap.x, ap.y, 1.8, aiVis * 0.8);
        }
      }

      bctx.globalAlpha = 1;
      fctx.globalAlpha = 1;
    };

    let t = 0;
    const draw = () => {
      t += 0.012;
      step(progress(), 0.15, t);
      if (alive && onScreen) raf = requestAnimationFrame(draw);
    };

    if (still) {
      // settle straight into the distributed field, one static paint (back
      // canvas only — no ring, no text-occlusion drama in reduced motion)
      for (let k = 0; k < 40; k++) step(1, 0.35, k * 0.012);
      step(1, 1, 1);
    } else {
      raf = requestAnimationFrame(draw);
    }

    const onResize = () => {
      resize();
      seed();
      if (still) step(1, 1, 1);
    };
    window.addEventListener("resize", onResize);

    const io = still
      ? null
      : new IntersectionObserver(
          ([e]) => {
            onScreen = e.isIntersecting;
            if (onScreen && alive) raf = requestAnimationFrame(draw);
          },
          { threshold: 0 }
        );
    io?.observe(section ?? host);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      io?.disconnect();
    };
  }, [still]);

  return (
    <>
      <canvas ref={backRef} className="absolute inset-0 h-full w-full" aria-hidden />
      <canvas ref={frontRef} className="absolute inset-0 z-20 h-full w-full" aria-hidden />
    </>
  );
}
