"use client";

/* =============================================================================
 * Shared brutalist primitives for the monochrome landing + auth surfaces.
 * Ink #0A0A0A on paper #F5F4F0. Reused across the hero, the problem section and
 * the sign-in screen so every surface shares one focal element and one dust
 * field. Respects prefers-reduced-motion via the `still` prop.
 * ========================================================================== */

import { useEffect, useRef, useState } from "react";
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
