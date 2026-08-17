"use client";

/* =============================================================================
 * Portrait disintegration — the hero's focal sequence, continuing all the way
 * into the globe. A monochrome portrait sits centered as a plain cut-out
 * photograph at rest; on scroll it disintegrates bottom-up into the same
 * ink-stipple dot language used elsewhere on the site, falls as rain, and —
 * using the SAME particles throughout, not a fresh set — gathers into the
 * rotating dot-globe that opens the next section. The canvas is page-fixed
 * (like the globe/whale canvases) specifically so the particles can keep
 * falling past the hero's own box without visually vanishing at the seam.
 *
 * Two layers, crossfaded via a spatial (not global) sweep:
 *  - a Canvas2D "still" layer: the crisp photo, cut out via a luminance +
 *    local-contrast alpha matte (no background-removal tool available — this
 *    works because the source background is dark/vignetted while the subject
 *    has fine local texture). A clip-path recedes bottom-to-top in lockstep
 *    with particle release, so there is never a moment where the whole photo
 *    has "become dots" before any of it has actually started disintegrating.
 *  - a WebGL (Three.js) point cloud sampled from the same image, one particle
 *    per accepted pixel, density weighted toward darker regions. Canvas 2D
 *    cannot hold 60fps at this particle count (40-80k), hence WebGL.
 *
 * Disintegration order is per-particle and purely spatial: particles nearer
 * the bottom of the frame release first and sweep upward — no separate
 * "convert everything to dots, then disintegrate" step.
 * ========================================================================== */

import { useEffect, useRef } from "react";
import * as THREE from "three";
import {
  buildGlobePts,
  type GlobePt,
  ARC_ROUTES,
  ARC_ROUTE_SAMPLES,
  ARC_CLUSTERS,
  ARC_CLUSTER_DOTS,
  ARC_CLUSTER_SPREAD,
  ARC_SPEED,
  arcPoint,
  containerX,
} from "./brutal";

const PORTRAIT_SRC = "/hero-portrait.png";
const INK_HEX = 0x2563eb;

// The hero intentionally loads part-way through the disintegration sequence.
// 0.48 means roughly the lower half has already started breaking apart.
const INITIAL_DISINTEGRATION = 0.12;

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const smooth = (e0: number, e1: number, x: number) => {
  const t = clamp01((x - e0) / (e1 - e0));
  return t * t * (3 - 2 * t);
};

// ---------------------------------------------------------------------------
// Shared image analysis — luminance + local-gradient pass. Doubles as (a) the
// source for the particle point cloud and (b) the alpha matte for the crisp
// still layer. Local gradient (texture/edges) separates the subject from the
// smooth vignette background far more robustly than a flat luminance cutoff;
// a permissive luminance floor on its own catches the duller, shadowed hair
// clumps that a pure-texture test would otherwise drop.
// ---------------------------------------------------------------------------
function analyzeImage(img: HTMLImageElement, aw: number) {
  const ah = Math.max(1, Math.round(aw * (img.naturalHeight / img.naturalWidth)));
  const c = document.createElement("canvas");
  c.width = aw;
  c.height = ah;
  const actx = c.getContext("2d", { willReadFrequently: true })!;
  actx.drawImage(img, 0, 0, aw, ah);
  const { data } = actx.getImageData(0, 0, aw, ah);
  const lum = new Float32Array(aw * ah);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    lum[p] = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
  }
  return { aw, ah, lum };
}

// Separable box blur at an arbitrary radius (two passes ~= gaussian).
function blurField(src: Float32Array, aw: number, ah: number, r: number): Float32Array {
  const tmp = new Float32Array(aw * ah);
  const out = new Float32Array(aw * ah);
  for (let y = 0; y < ah; y++) {
    for (let x = 0; x < aw; x++) {
      const x0 = Math.max(0, x - r), x1 = Math.min(aw - 1, x + r);
      let sum = 0;
      for (let xx = x0; xx <= x1; xx++) sum += src[y * aw + xx];
      tmp[y * aw + x] = sum / (x1 - x0 + 1);
    }
  }
  for (let y = 0; y < ah; y++) {
    for (let x = 0; x < aw; x++) {
      const y0 = Math.max(0, y - r), y1 = Math.min(ah - 1, y + r);
      let sum = 0;
      for (let yy = y0; yy <= y1; yy++) sum += tmp[yy * aw + x];
      out[y * aw + x] = sum / (y1 - y0 + 1);
    }
  }
  return out;
}

// The background is a smooth vignette; the subject includes both bright skin
// AND dark hair, so absolute luminance can't separate subject from
// background — dark hair scores the same as a dark background region. Local
// deviation from a large-radius blur (the "background trend") catches both:
// the smooth vignette barely differs from its own local trend, while any
// subject material — bright or dark — does. Local gradient is kept as a
// second signal so fine loose strands right at the silhouette edge, too thin
// to shift the trend much, still register via texture/edges.
function computeScoreField(aw: number, ah: number, lum: Float32Array): Float32Array {
  const bgTrend = blurField(lum, aw, ah, Math.round(aw * 0.07));
  const raw = new Float32Array(aw * ah);
  for (let y = 0; y < ah; y++) {
    for (let x = 0; x < aw; x++) {
      const p = y * aw + x;
      let grad = 0;
      if (x > 0 && x < aw - 1 && y > 0 && y < ah - 1) {
        const gx = lum[p + 1] - lum[p - 1];
        const gy = lum[p + aw] - lum[p - aw];
        grad = Math.hypot(gx, gy);
      }
      const dev = Math.abs(lum[p] - bgTrend[p]);
      // Bright-skin branch kept alongside deviation: skin's own gradual
      // shading can have low deviation from its local trend too, and
      // without this branch that read as faint smudging across the face.
      raw[p] = Math.max(smooth(0.02, 0.09, grad), smooth(0.05, 0.16, dev), smooth(0.1, 0.26, lum[p]));
    }
  }
  // Small-radius smoothing pass: per-pixel scoring is still noisy in fine,
  // high-contrast texture (individual windblown strands) — this spreads that
  // into soft, feathered transitions instead of a blotchy/dithered look.
  return blurField(blurField(raw, aw, ah, 1), aw, ah, 1);
}

function buildAlphaMatte(aw: number, ah: number, score: Float32Array): HTMLCanvasElement {
  const mc = document.createElement("canvas");
  mc.width = aw;
  mc.height = ah;
  const mctx = mc.getContext("2d")!;
  const mdata = mctx.createImageData(aw, ah);
  for (let p = 0; p < aw * ah; p++) {
    const di = p * 4;
    mdata.data[di] = mdata.data[di + 1] = mdata.data[di + 2] = 255;
    mdata.data[di + 3] = Math.round(clamp01(score[p]) * 255);
  }
  mctx.putImageData(mdata, 0, 0);
  return mc;
}

type Sample = { nx: number; ny: number; lum: number };
function sampleParticles(aw: number, ah: number, lum: Float32Array, score: Float32Array): Sample[] {
  const pts: Sample[] = [];
  for (let y = 1; y < ah - 1; y++) {
    for (let x = 1; x < aw - 1; x++) {
      const p = y * aw + x;
      const s = score[p];
      if (s < 0.05) continue;
      const l = lum[p];
      // Keep the cloud lighter and airier so the pre-disintegrated state feels
      // organic rather than like a dense field of noise.
      const density = clamp01(s * (0.26 + (1 - l) * 0.58));
      if (Math.random() > density) continue;
      pts.push({ nx: x / aw, ny: y / ah, lum: l });
    }
  }
  return pts;
}

// Portrait box: centered, sized off viewport height. Shared by both the
// still and live layers so they align pixel-for-pixel during the handoff.
function layoutBox(vw: number, vh: number, imgAspect: number) {
  const mob = vw < 640;
  const boxH = vh * (mob ? 0.44 : 0.65);
  const boxW = boxH * imgAspect;
  // Left/right split, bleeding off the right edge of the same centered
  // max-w-[1600px] container the nav/text use (not the raw viewport edge —
  // that drifted the portrait past the nav on wide/ultrawide screens).
  const boxX = containerX(vw, 1) - boxW * (mob ? 0.7 : 0.86);
  const boxY = (vh - boxH) / 2;
  return { boxX, boxY, boxW, boxH };
}

/** Reduced motion / pre-mount: a plain, centered, masked cut-out photo — no
 * canvas animation, no scroll listener. Sits in normal hero layout flow. */
export function PortraitStill() {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let alive = true;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const img = new Image();
    img.decoding = "async";
    let matte: HTMLCanvasElement | null = null;
    let box = { boxX: 0, boxY: 0, boxW: 0, boxH: 0 };

    const paint = () => {
      if (!matte) return;
      const vw = host.clientWidth, vh = host.clientHeight;
      box = layoutBox(vw, vh, img.naturalWidth / img.naturalHeight || 1.5);
      canvas.width = Math.max(1, Math.floor(box.boxW * dpr));
      canvas.height = Math.max(1, Math.floor(box.boxH * dpr));
      canvas.style.width = `${box.boxW}px`;
      canvas.style.height = `${box.boxH}px`;
      canvas.style.left = `${box.boxX}px`;
      canvas.style.top = `${box.boxY}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, box.boxW, box.boxH);
      ctx.drawImage(img, 0, 0, box.boxW, box.boxH);
      ctx.globalCompositeOperation = "destination-in";
      ctx.drawImage(matte, 0, 0, box.boxW, box.boxH);
      ctx.globalCompositeOperation = "source-over";
    };

    img.onload = () => {
      if (!alive) return;
      const { aw, ah, lum } = analyzeImage(img, 360);
      matte = buildAlphaMatte(aw, ah, computeScoreField(aw, ah, lum));
      paint();
    };
    img.src = PORTRAIT_SRC;
    window.addEventListener("resize", paint);
    return () => {
      alive = false;
      window.removeEventListener("resize", paint);
    };
  }, []);

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0" aria-hidden>
      <canvas ref={canvasRef} className="absolute" />
    </div>
  );
}

/** Live sequence: page-fixed, spans the full viewport. Portrait disintegrates
 * bottom-up, falls as rain, and gathers into the rotating dot-globe using the
 * SAME particles the whole way through — driven by absolute page scroll, not
 * scoped to the hero's own box, so nothing has to "restart" once the hero's
 * pinned track releases and the globe section takes over. */
export function PortraitDisintegration() {
  const stillCanvasRef = useRef<HTMLCanvasElement>(null);
  const glHostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const stillCanvas = stillCanvasRef.current;
    const glHost = glHostRef.current;
    if (!stillCanvas || !glHost) return;
    const sctx = stillCanvas.getContext("2d");
    if (!sctx) return;

    let alive = true;
    let raf = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const lowPower = (navigator.hardwareConcurrency || 8) <= 4 || window.innerWidth < 640;
    const heroEl = document.querySelector("[data-hero]") as HTMLElement | null;

    let vw = 0, vh = 0;
    let box = { boxX: 0, boxY: 0, boxW: 0, boxH: 0 };
    let imgAspect = 1.5;

    // Globe target — same viewport anchor the old globe section used, so the
    // formed sphere sits where the rest of the layout (and its text) expects.
    let globeX = 0, globeY = 0, Rg = 0;
    const GLOBE_SQUASH = 1; // sphere tilt handled separately, see TILT below
    const TILT = 0.34;
    const SPIN = (Math.PI * 2) / 40;

    const layout = () => {
      box = layoutBox(vw, vh, imgAspect);
      const mob = vw < 640;
      globeX = containerX(vw, mob ? 0.5 : 0.68);
      globeY = vh * (mob ? 0.62 : 0.58);
      Rg = mob ? vw * 0.33 : vh * 0.3;
    };

    const sizeCanvas = (c: HTMLCanvasElement) => {
      c.width = Math.max(1, Math.floor(vw * dpr));
      c.height = Math.max(1, Math.floor(vh * dpr));
      c.style.width = `${vw}px`;
      c.style.height = `${vh}px`;
    };

    const img = new Image();
    img.decoding = "async";
    let matte: HTMLCanvasElement | null = null;

    const paintStill = (bottomClipPct: number) => {
      if (!matte) return;
      sctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      sctx.clearRect(0, 0, vw, vh);
      sctx.save();
      sctx.beginPath();
      // Use a subtly irregular edge instead of a perfectly straight cut.
      // The variation is deterministic, so it stays visually stable between
      // frames while the particle layer supplies the actual falling/dissolving.
      const edgeY = box.boxY + box.boxH * (1 - bottomClipPct);
      const steps = Math.max(12, Math.ceil(box.boxW / 28));
      sctx.moveTo(box.boxX, box.boxY);
      sctx.lineTo(box.boxX, edgeY);
      for (let i = 0; i <= steps; i++) {
        const px = box.boxX + (i / steps) * box.boxW;
        const wave = Math.sin(i * 2.17) * 7 + Math.sin(i * 0.73 + 1.4) * 4;
        const py = edgeY + wave * (bottomClipPct > 0.05 ? Math.min(1, bottomClipPct * 1.8) : 0);
        sctx.lineTo(px, py);
      }
      sctx.lineTo(box.boxX + box.boxW, box.boxY);
      sctx.closePath();
      sctx.clip();
      sctx.drawImage(img, box.boxX, box.boxY, box.boxW, box.boxH);
      sctx.globalCompositeOperation = "destination-in";
      sctx.drawImage(matte, box.boxX, box.boxY, box.boxW, box.boxH);
      sctx.globalCompositeOperation = "source-over";
      sctx.restore();
    };

    // --- WebGL ---
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false });
    renderer.setPixelRatio(dpr);
    glHost.appendChild(renderer.domElement);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(0, 1, 0, 1, -1000, 1000);
    camera.position.z = 500;
    const material = new THREE.ShaderMaterial({
      uniforms: { uPixelRatio: { value: dpr }, uColor: { value: new THREE.Color(INK_HEX) } },
      vertexShader: /* glsl */ `
        attribute float aSize;
        attribute float aAlpha;
        uniform float uPixelRatio;
        varying float vAlpha;
        void main() {
          vAlpha = aAlpha;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = aSize * uPixelRatio;
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        uniform vec3 uColor;
        varying float vAlpha;
        void main() { gl_FragColor = vec4(uColor, vAlpha); }
      `,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    // Data-transfer arcs — great-circle routes between real-world hubs,
    // drawn as a faint static dotted path plus small "packet" bursts that
    // loop along it. Same spin/tilt projection as the globe dust so they
    // read as part of the same object. Only appears once the globe (formed
    // from the portrait's own particles) has essentially finished forming.
    const arcPaths = ARC_ROUTES.map((route) =>
      Array.from({ length: ARC_ROUTE_SAMPLES }, (_, i) => arcPoint(route, i / (ARC_ROUTE_SAMPLES - 1)))
    );
    const ARC_TOTAL = ARC_ROUTES.length * (ARC_ROUTE_SAMPLES + ARC_CLUSTERS * ARC_CLUSTER_DOTS);
    const arcPositions = new Float32Array(ARC_TOTAL * 3);
    const arcAlphas = new Float32Array(ARC_TOTAL);
    const arcSizes = new Float32Array(ARC_TOTAL);
    const arcGeometry = new THREE.BufferGeometry();
    arcGeometry.setAttribute("position", new THREE.BufferAttribute(arcPositions, 3));
    arcGeometry.setAttribute("aAlpha", new THREE.BufferAttribute(arcAlphas, 1));
    arcGeometry.setAttribute("aSize", new THREE.BufferAttribute(arcSizes, 1));
    const arcPoints = new THREE.Points(arcGeometry, material);
    scene.add(arcPoints);

    type Part = {
      ix: number; iy: number; lum: number; // home (image-space) position + tone
      t0Vh: number; // absolute totalScrollVh at which this particle releases
      rox: number; roy: number; // small in-place dissolve drift for non-globe particles
      // Only a subset of particles (matching the globe's original density —
      // not this whole 40-80k cloud) actually falls into the sphere, visibly
      // dropping from wherever it detached off the girl's body. Everything
      // else is still the SAME particle that was the portrait, it just
      // dissolves in place shortly after release rather than falling all
      // the way down — "vanishes" instead of raining to the bottom.
      glb: GlobePt | null;
      x: number; y: number;
    };
    let parts: Part[] = [];
    let positions: Float32Array | null = null;
    let alphas: Float32Array | null = null;
    let sizes: Float32Array | null = null;
    let geometry: THREE.BufferGeometry | null = null;
    let points: THREE.Points | null = null;

    // Absolute-scroll reference points (vh units from page top), recomputed on
    // resize. Everything downstream — release order, rain, globe formation —
    // is expressed in this one continuous coordinate so nothing has to "hand
    // off" between two different progress systems at the section boundary.
    let heroTopVh = 0, disintEndVh = 0;
    const computeRefs = () => {
      const heroTop = heroEl ? heroEl.getBoundingClientRect().top + window.scrollY : 0;
      const heroTrackPx = heroEl?.offsetHeight ?? vh;
      heroTopVh = heroTop / vh;
      disintEndVh = heroTopVh + (heroTrackPx / vh) * 0.85;
    };

    const buildParts = (cloud: Sample[]) => {
      // Same density the globe has always had elsewhere on the site — not
      // this whole 40-80k portrait cloud. Pick an evenly-strided subset (not
      // random, so it's not biased toward any one tonal region) to receive
      // globe targets; everything else keeps falling as plain rain.
      const GLOBE_N = lowPower ? 1050 : 1700;
      const glb = buildGlobePts(Math.min(GLOBE_N, cloud.length));
      const stride = Math.max(1, Math.floor(cloud.length / glb.length));
      parts = cloud.map((c, i) => {
        const sweepSpan = Math.max(0.05, disintEndVh - heroTopVh) * 0.92;
        // Clamped at heroTopVh: negative jitter on the earliest (bottom-most)
        // particles could otherwise push t0Vh below the scroll-start point,
        // making them already "released" — visible as dots — at scrollY=0.
        const t0Vh = Math.max(heroTopVh, heroTopVh + (1 - c.ny) * sweepSpan + (Math.random() - 0.5) * sweepSpan * 0.12);
        const globeIdx = i % stride === 0 ? Math.floor(i / stride) : -1;
        const isGlobeMember = globeIdx >= 0 && globeIdx < glb.length;
        return {
          ix: c.nx, iy: c.ny, lum: c.lum,
          t0Vh,
          rox: (Math.random() * 2 - 1) * 22,
          roy: (Math.random() * 2 - 1) * 16,
          glb: isGlobeMember ? glb[globeIdx] : null,
          x: 0, y: 0,
        };
      });
      const n = parts.length;
      positions = new Float32Array(n * 3);
      alphas = new Float32Array(n);
      sizes = new Float32Array(n);
      geometry?.dispose();
      geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aAlpha", new THREE.BufferAttribute(alphas, 1));
      geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
      if (points) scene.remove(points);
      points = new THREE.Points(geometry, material);
      scene.add(points);
      for (const pt of parts) {
        pt.x = box.boxX + pt.ix * box.boxW;
        pt.y = box.boxY + pt.iy * box.boxH;
      }
    };

    const resize = () => {
      vw = window.innerWidth;
      vh = window.innerHeight;
      renderer.setSize(vw, vh);
      camera.left = 0; camera.right = vw; camera.top = 0; camera.bottom = vh;
      camera.updateProjectionMatrix();
      sizeCanvas(stillCanvas);
      layout();
      computeRefs();
      for (const pt of parts) {
        pt.x = box.boxX + pt.ix * box.boxW;
        pt.y = box.boxY + pt.iy * box.boxH;
      }
    };

    let ready = false;
    img.onload = async () => {
      if (!alive) return;
      try { await img.decode(); } catch { /* best effort */ }
      if (!alive) return;
      imgAspect = img.naturalWidth / img.naturalHeight;
      vw = window.innerWidth; vh = window.innerHeight;
      layout();
      computeRefs();
      const { aw, ah, lum } = analyzeImage(img, lowPower ? 360 : 500);
      const score = computeScoreField(aw, ah, lum);
      matte = buildAlphaMatte(aw, ah, score);
      const cloud = sampleParticles(aw, ah, lum, score);
      buildParts(cloud);
      resize();
      ready = true;
    };
    img.src = PORTRAIT_SRC;

    // Scroll-time (vh) a globe-member particle takes to fall from its home
    // position on the girl's body into its final spot in the sphere, and how
    // long a non-member takes to dissolve in place. Both are driven by the
    // particle's own `released` clock, not by screen distance to the globe —
    // that's what keeps the non-globe majority from piling into a dense
    // column as it "falls" toward the sphere.
    const FALL_F = 0.5;
    const VANISH_F = 0.22;

    let onScreen = true;
    let t = 0;
    const draw = () => {
      t += 0.01;
      renderer.autoClear = true;
      if (ready && positions && alphas && sizes && points && geometry) {
        // Start the animation as if the user has already scrolled into the
        // hero. Further scrolling continues naturally from this state.
        const initialOffsetVh = Math.max(0.05, disintEndVh - heroTopVh) * INITIAL_DISINTEGRATION;
        const totalVh = window.scrollY / vh + heroTopVh + initialOffsetVh;
        const sweepFrac = clamp01((totalVh - heroTopVh) / Math.max(0.05, disintEndVh - heroTopVh - (disintEndVh - heroTopVh) * 0.08));
        paintStill(sweepFrac);

        const spinA = (performance.now() / 1000) * SPIN;
        const cosA = Math.cos(spinA), sinA = Math.sin(spinA);
        const cosT = Math.cos(TILT), sinT = Math.sin(TILT);

        for (let i = 0; i < parts.length; i++) {
          const pt = parts[i];
          const homeX = box.boxX + pt.ix * box.boxW;
          const homeY = box.boxY + pt.iy * box.boxH;

          const released = totalVh - pt.t0Vh;
          const preA = 0.3 + (1 - pt.lum) * 0.5;
          const preS = 1.5 + (1 - pt.lum) * 0.9;

          let tx: number, ty: number, a: number, s: number;
          if (released <= 0) {
            // still part of the crisp photo — invisible in the WebGL layer
            tx = homeX; ty = homeY; a = 0; s = 1.2;
          } else if (pt.glb) {
            // globe member — falls straight down off the girl's body first,
            // then curves horizontally into its spinning globe position, so
            // the trajectory reads as "came from her" rather than teleporting.
            const gatherT = clamp01(released / FALL_F);
            const x1 = pt.glb.ux * cosA + pt.glb.uz * sinA;
            const z1 = -pt.glb.ux * sinA + pt.glb.uz * cosA;
            const y2 = pt.glb.uy * cosT - z1 * sinT;
            const z2 = pt.glb.uy * sinT + z1 * cosT;
            const gx = globeX + x1 * Rg;
            const gy = globeY - y2 * Rg * GLOBE_SQUASH;
            const front = z2 * 0.5 + 0.5;
            tx = lerp(homeX, gx, smooth(0.35, 1, gatherT));
            ty = lerp(homeY, gy, smooth(0, 0.7, gatherT));
            // continent-biased shading (buildGlobePts' ga/gs) takes over as
            // it settles, so the formed sphere shows land masses correctly
            const shapeT = smooth(0.6, 1, gatherT);
            const gA = pt.glb.ga * (0.3 + 0.7 * front);
            const gS = pt.glb.gs * (0.72 + 0.42 * front);
            a = lerp(preA, gA, shapeT);
            s = lerp(preS, gS, shapeT);
          } else {
            // not part of the globe's subset — the SAME particle that left
            // the girl's body just dissolves in place shortly after release,
            // rather than falling to the bottom of the screen.
            const vanishT = clamp01(released / VANISH_F);
            const driftT = smooth(0, 0.6, vanishT);
            tx = homeX + pt.rox * driftT;
            ty = homeY + pt.roy * driftT;
            a = preA * (1 - smooth(0.25, 1, vanishT));
            s = preS;
          }

          pt.x += (tx - pt.x) * 0.22;
          pt.y += (ty - pt.y) * 0.22;
          positions![i * 3] = pt.x;
          positions![i * 3 + 1] = pt.y;
          positions![i * 3 + 2] = 0;
          alphas![i] = Math.max(0, a);
          sizes![i] = Math.max(0.6, s);
        }
        geometry.attributes.position.needsUpdate = true;
        geometry.attributes.aAlpha.needsUpdate = true;
        geometry.attributes.aSize.needsUpdate = true;

        // Data-transfer arcs — only once the globe (formed from the last,
        // latest-releasing particles) has essentially finished settling.
        const globeCompleteVh = disintEndVh + FALL_F + 0.05;
        const arcT = smooth(globeCompleteVh, globeCompleteVh + 0.15, totalVh);
        const projectArc = (lp: { x: number; y: number; z: number }) => {
          const x1 = lp.x * cosA + lp.z * sinA;
          const z1 = -lp.x * sinA + lp.z * cosA;
          const y2 = lp.y * cosT - z1 * sinT;
          const z2 = lp.y * sinT + z1 * cosT;
          const front = 0.3 + 0.7 * (z2 * 0.5 + 0.5);
          return { sx: globeX + x1 * Rg, sy: globeY - y2 * Rg, front };
        };
        let ai = 0;
        for (let ri = 0; ri < arcPaths.length; ri++) {
          const path = arcPaths[ri];
          for (let i = 0; i < path.length; i++) {
            const { sx, sy, front } = projectArc(path[i]);
            arcPositions[ai * 3] = sx; arcPositions[ai * 3 + 1] = sy; arcPositions[ai * 3 + 2] = 0;
            arcAlphas[ai] = arcT * front * 0.14;
            arcSizes[ai] = 1;
            ai++;
          }
          for (let cl = 0; cl < ARC_CLUSTERS; cl++) {
            const phase = cl / ARC_CLUSTERS;
            const frac = (((t * ARC_SPEED + ri * 0.37 + phase) % 1) + 1) % 1;
            for (let d = 0; d < ARC_CLUSTER_DOTS; d++) {
              const j = ((d * 0.618034) % 1) - 0.5;
              const ft = (((frac + j * ARC_CLUSTER_SPREAD) % 1) + 1) % 1;
              const { sx, sy, front } = projectArc(arcPoint(ARC_ROUTES[ri], ft));
              arcPositions[ai * 3] = sx; arcPositions[ai * 3 + 1] = sy; arcPositions[ai * 3 + 2] = 0;
              arcAlphas[ai] = arcT * front * 0.82;
              arcSizes[ai] = 1.9 + (d % 2) * 0.5;
              ai++;
            }
          }
        }
        arcGeometry.attributes.position.needsUpdate = true;
        arcGeometry.attributes.aAlpha.needsUpdate = true;
        arcGeometry.attributes.aSize.needsUpdate = true;
      }
      renderer.render(scene, camera);
      if (alive && onScreen) raf = requestAnimationFrame(draw);
    };

    resize();
    raf = requestAnimationFrame(draw);
    const onResize = () => resize();
    window.addEventListener("resize", onResize);
    const io = new IntersectionObserver(([e]) => { onScreen = e.isIntersecting || window.scrollY < vh * 6; }, { threshold: 0 });
    // No single element sensibly bounds "hero through globe formed" for IO
    // purposes; keep the loop running (it's cheap) rather than risk pausing
    // mid-handoff. onScreen stays true in practice via the fallback above.

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      io.disconnect();
      geometry?.dispose();
      arcGeometry.dispose();
      material.dispose();
      renderer.dispose();
      if (glHost.contains(renderer.domElement)) glHost.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <>
      <canvas ref={stillCanvasRef} className="pointer-events-none fixed inset-0 z-[1] h-full w-full" aria-hidden />
      <div ref={glHostRef} className="pointer-events-none fixed inset-0 z-[1] h-full w-full" aria-hidden />
    </>
  );
}