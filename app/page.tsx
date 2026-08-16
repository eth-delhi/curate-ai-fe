"use client";

/* =============================================================================
 * CURATE AI — landing (one long brutalist page)
 * Strict monochrome: ink #0A0A0A on paper #F5F4F0. Shared ambient-dust layer and
 * custom cursor persist across sections; each section inherits the same world.
 *   1. Hero        — studio statement + generative neural cloud
 *   2. Problem     — two-column indictment of Web2 blogging vs Web3 social
 * Respects prefers-reduced-motion and degrades to static on low power.
 * ========================================================================== */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  INK,
  PAPER,
  EXPO,
  display,
  CustomCursor,
  NeuralCloud,
  ParticleBirds,
  CloudGlobe,
  WhaleCircle,
} from "@/components/brutal";
import { Logo } from "@/components/ui/Logo";

function NavLink({ label }: { label: string }) {
  return (
    <a
      href="#"
      className={`group relative text-[10px] tracking-[0.14em] sm:text-[11px] sm:tracking-[0.22em] font-medium uppercase ${display}`}
      style={{ color: INK }}
    >
      {label}
      <span
        className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 transition-transform duration-300 ease-out group-hover:scale-x-100"
        style={{ backgroundColor: INK }}
      />
    </a>
  );
}

// ===========================================================================
// SECTION 1 — HERO
// ===========================================================================
const NAV = ["HOME", "WORK", "STUDIO", "CONTACT"];
const HEADLINE = [
  { text: "WE CURATE", indent: 0 },
  { text: "INTELLIGENCE.", indent: 0.55 },
  { text: "MACHINES DO", indent: 0 },
  { text: "THE REST.", indent: 0 },
];

// Nav height (logo + top/bottom padding) that the hero's own centering math
// compensates for now that the nav lives outside the hero as a sticky sibling.
const NAV_H = 92;

function SiteNav({ animate }: { animate: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const marqueeSeg = "BUILDING AI × WEB3";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full transition-[background-color,box-shadow] duration-300 ease-out"
      style={{
        backgroundColor: scrolled ? "rgba(245,244,240,0.72)" : "rgba(245,244,240,0)",
        backdropFilter: scrolled ? "blur(10px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(10px)" : "none",
        boxShadow: scrolled ? "0 1px 0 0 rgba(10,10,10,0.08)" : "0 1px 0 0 rgba(10,10,10,0)",
      }}
    >
      <div className="relative mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 pt-6 pb-3 sm:px-8 lg:px-12">
        <a href="/" data-cursor className="inline-block" aria-label="Curate AI home">
          <Logo className="h-14 w-14 shrink-0 text-foreground" />
        </a>

        <div
          className="absolute left-1/2 top-7 hidden max-w-[240px] -translate-x-1/2 overflow-hidden rounded-full border px-1 md:block"
          style={{ borderColor: INK }}
        >
          <motion.div
            className="flex whitespace-nowrap py-1"
            animate={animate ? { x: ["0%", "-50%"] } : undefined}
            transition={animate ? { duration: 14, ease: "linear", repeat: Infinity } : undefined}
          >
            {[0, 1].map((k) => (
              <span key={k} className="flex shrink-0">
                {[0, 1, 2].map((j) => (
                  <span
                    key={j}
                    className={`mx-3 inline-flex items-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] ${display}`}
                  >
                    <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ backgroundColor: INK }} />
                    {marqueeSeg}
                  </span>
                ))}
              </span>
            ))}
          </motion.div>
        </div>

        <nav className="hidden items-center gap-8 sm:flex">
          {NAV.map((l) => (
            <NavLink key={l} label={l} />
          ))}
        </nav>
      </div>
    </header>
  );
}

function Hero({ animate }: { animate: boolean }) {
  const { scrollY } = useScroll();
  const headY = useTransform(scrollY, [0, 700], [0, -70]);

  return (
    <section
      data-hero
      className="relative w-full overflow-hidden"
      style={{ minHeight: `calc(100svh - ${NAV_H}px)` }}
    >
      {/* Focal cloud. When animating, the page-level CloudGlobe renders the cloud
          here (it later rains down into the section-two globe). Under reduced
          motion CloudGlobe shows only the globe, so keep a static cloud here. */}
      {!animate && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-0 w-[92%] sm:w-[74%] lg:w-[62%]">
          <NeuralCloud still />
        </div>
      )}

      {/* Scroll-scrubbed flock — rests as ambient dust at the baseline, coheres
          into pigeons and lifts through the cloud as the hero scrolls away */}
      <div className="pointer-events-none absolute inset-0 z-[1]" aria-hidden>
        <ParticleBirds still={!animate} />
      </div>

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto flex w-full max-w-[1600px] flex-col justify-center px-5 pb-16 pt-10 sm:px-8 lg:px-12"
        style={{ y: animate ? headY : 0, minHeight: `calc(100svh - ${NAV_H}px)` }}
      >
        <h1 className={`${display} font-black uppercase leading-[0.86] tracking-[-0.02em] text-[clamp(1.75rem,8.2vw,8rem)]`}>
          {HEADLINE.map((line, i) => (
            <span key={line.text} className="block overflow-hidden pr-2">
              <motion.span
                className="block will-change-transform"
                style={{ paddingLeft: `${line.indent}em` }}
                initial={animate ? { y: "112%" } : false}
                animate={animate ? { y: "0%" } : undefined}
                transition={animate ? { duration: 0.8, ease: EXPO, delay: 0.12 + i * 0.12 } : undefined}
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <motion.div
          className="mt-10 max-w-xl"
          initial={animate ? { opacity: 0, y: 16 } : false}
          animate={animate ? { opacity: 1, y: 0 } : undefined}
          transition={animate ? { duration: 0.7, delay: 0.7, ease: EXPO } : undefined}
        >
          <p className={`${display} max-w-xs text-[10px] font-medium uppercase leading-[2] tracking-[0.14em] sm:max-w-md sm:text-[11px] sm:leading-[1.9] sm:tracking-[0.24em]`}>
            AI agents + blockchain infra + full-stack product. We build it end to
            end. Relax — we&apos;ve got this.
          </p>

          <a
            href="#"
            data-cursor
            className={`group mt-8 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.2em] ${display}`}
            style={{ color: INK }}
          >
            <span className="relative">
              Start a project
              <span
                className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left transition-all duration-300 ease-out group-hover:h-[3px]"
                style={{ backgroundColor: INK }}
              />
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}

// ===========================================================================
// SECTION 2 — SIGNAL (cloud → rain → globe, the mission beat)
// ===========================================================================
const SIGNAL_HEAD = ["YOUR DATA", "IS THE", "PRODUCT."];

function SignalSection({ animate }: { animate: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-25% 0px -25% 0px" });
  const show = !animate || inView;

  return (
    // Tall scroll track; the text pins while the page-level CloudGlobe rains the
    // hero cloud down and reassembles it into the globe in the right zone.
    <section data-signal ref={ref} className="relative" style={{ height: "160vh" }}>
      <div className="sticky top-0 flex h-[100svh] w-full items-center overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-[1600px] flex-col px-5 sm:px-8 lg:flex-row lg:items-center lg:px-12">
          {/* Left — mission copy */}
          <div className="relative z-10 flex w-full shrink-0 flex-col justify-center pt-24 pb-6 lg:w-[43%] lg:pt-0 lg:pb-0 lg:pr-10">
            <motion.p
              className={`${display} text-[10px] font-medium uppercase tracking-[0.3em] text-[#0A0A0A]/55 sm:text-[11px]`}
              initial={animate ? { opacity: 0, y: 12 } : false}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, ease: EXPO }}
            >
              From noise to signal
            </motion.p>

            <h2 className={`${display} mt-5 font-black uppercase leading-[0.9] tracking-[-0.02em] text-[clamp(1.9rem,4.6vw,4rem)]`}>
              {SIGNAL_HEAD.map((line, i) => (
                <span key={line} className="block overflow-hidden pr-1">
                  <motion.span
                    className="block will-change-transform"
                    initial={animate ? { y: "112%" } : false}
                    animate={show ? { y: "0%" } : {}}
                    transition={{ duration: 0.7, ease: EXPO, delay: animate ? 0.1 + i * 0.1 : 0 }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h2>

            <motion.p
              className={`${display} mt-8 max-w-sm text-[10px] font-medium uppercase leading-[2] tracking-[0.14em] text-[#0A0A0A]/55 sm:text-[11px] sm:leading-[1.9] sm:tracking-[0.2em]`}
              initial={animate ? { opacity: 0, y: 14 } : false}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: animate ? 0.5 : 0, ease: EXPO }}
            >
              We turn scattered writing into structured, provable knowledge — surfaced
              on merit, for everyone, everywhere.
            </motion.p>

            <motion.a
              href="#problem"
              data-cursor
              className={`group mt-9 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.2em] ${display}`}
              style={{ color: INK }}
              initial={animate ? { opacity: 0, y: 14 } : false}
              animate={show ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: animate ? 0.62 : 0, ease: EXPO }}
            >
              <span className="relative">
                See how it works
                <span
                  className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left transition-all duration-300 ease-out group-hover:h-[3px]"
                  style={{ backgroundColor: INK }}
                />
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </motion.a>
          </div>

          {/* Right — reserves the zone where the page-level CloudGlobe forms */}
          <div className="w-full flex-1 min-h-[44svh] lg:h-full lg:min-h-0" aria-hidden />
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// SECTION 3 — THE PROBLEM (two-column indictment)
// ===========================================================================
const COLUMNS = [
  {
    label: "WEB2 BLOGGING",
    head: "ONE COMPANY OWNS YOUR VOICE.",
    rows: [
      {
        t: "SINGLE POINT OF CONTROL",
        d: "One platform holds your content, your audience, your archive.",
      },
      {
        t: "SHADOW BANNED WITHOUT WARNING",
        d: "Reach disappears overnight. No explanation. No appeal.",
      },
      {
        t: "YOUR DATA IS THE PRODUCT",
        d: "You write it. They sell it. You get nothing back.",
      },
    ],
  },
  {
    label: "WEB3 SOCIAL",
    head: "DECENTRALIZED, BUT STILL BROKEN.",
    rows: [
      {
        t: "WHALE-CONTROLLED VOTING",
        d: "A handful of large holders decide what surfaces. Same gatekeeping, new wrapper.",
      },
      {
        t: "DISCOVERY DOESN'T WORK",
        d: "No algorithm worth trusting. Good content disappears into the feed.",
      },
      {
        t: "TOO MUCH FRICTION TO USE",
        d: "Wallets, gas, seed phrases. Most writers never make it past setup.",
      },
    ],
  },
] as const;

/** Two-digit number that rolls up from 00 as it enters. */
function RollNumber({
  value,
  play,
  reduced,
  delay,
}: {
  value: number;
  play: boolean;
  reduced: boolean;
  delay: number;
}) {
  if (reduced) return <span>{`0${value}`}</span>;
  return (
    <span className="inline-flex leading-none">
      <span>0</span>
      <span className="relative inline-block overflow-hidden" style={{ height: "1em" }}>
        <motion.span
          className="block"
          initial={{ y: 0 }}
          animate={play ? { y: `-${value}em` } : { y: 0 }}
          transition={{ duration: 0.7, ease: EXPO, delay }}
        >
          {Array.from({ length: 10 }).map((_, d) => (
            <span key={d} className="block leading-none" style={{ height: "1em" }}>
              {d}
            </span>
          ))}
        </motion.span>
      </span>
    </span>
  );
}

function ProblemRow({
  index,
  title,
  desc,
  inView,
  animate,
  reduced,
}: {
  index: number;
  title: string;
  desc: string;
  inView: boolean;
  animate: boolean;
  reduced: boolean;
}) {
  const delay = 0.7 + index * 0.14; // parallel across columns (same per row index)
  return (
    <motion.div
      className="group grid grid-cols-[2.75rem_1fr] gap-4 border-t py-6 sm:grid-cols-[3.5rem_1fr] sm:gap-5 sm:py-7"
      style={{ borderColor: "rgba(10,10,10,0.14)" }}
      initial={animate ? { opacity: 0, y: 22 } : false}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: animate ? delay : 0, ease: EXPO }}
    >
      <span
        className={`${display} block select-none text-2xl font-black tabular-nums text-transparent transition-colors duration-200 group-hover:text-[#0A0A0A] sm:text-3xl`}
        style={{ WebkitTextStroke: `1.3px ${INK}` }}
      >
        <RollNumber value={index + 1} play={inView} reduced={reduced} delay={delay + 0.1} />
      </span>
      <div>
        <h4 className={`${display} text-sm font-black uppercase leading-tight tracking-tight sm:text-base`}>
          {title}
        </h4>
        <p className="mt-2 max-w-sm text-[13px] font-normal leading-relaxed text-[#0A0A0A]/55 transition-all duration-200 group-hover:font-medium group-hover:text-[#0A0A0A]">
          {desc}
        </p>
      </div>
    </motion.div>
  );
}

function ProblemColumn({
  data,
  inView,
  animate,
  reduced,
  side,
}: {
  data: (typeof COLUMNS)[number];
  inView: boolean;
  animate: boolean;
  reduced: boolean;
  side: "left" | "right";
}) {
  return (
    <div className={side === "left" ? "md:pr-10 lg:pr-16" : "md:pl-10 lg:pl-16"}>
      <motion.div
        initial={animate ? { opacity: 0, y: 16 } : false}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: animate ? 0.55 : 0, ease: EXPO }}
      >
        <p className={`${display} text-[10px] font-medium uppercase tracking-[0.22em] text-[#0A0A0A]/60 sm:text-[11px]`}>
          {data.label}
        </p>
        <h3 className={`${display} mt-3 text-xl font-black uppercase leading-[1.04] tracking-tight sm:text-2xl lg:text-[1.7rem] md:min-h-[2.1em]`}>
          {data.head}
        </h3>
      </motion.div>

      <div className="mt-7">
        {data.rows.map((r, i) => (
          <ProblemRow
            key={r.t}
            index={i}
            title={r.t}
            desc={r.d}
            inView={inView}
            animate={animate}
            reduced={reduced}
          />
        ))}
      </div>
    </div>
  );
}

function ProblemSection({ animate, reduced }: { animate: boolean; reduced: boolean }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-12% 0px -12% 0px" });

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Divider: a quiet thicken/glow beat as the section crosses viewport centre.
  const pulseX = useTransform(scrollYProgress, [0.4, 0.5, 0.6], [1, 2.6, 1]);
  const glow = useTransform(
    scrollYProgress,
    [0.4, 0.5, 0.6],
    ["0 0 0px rgba(10,10,10,0)", "0 0 12px rgba(10,10,10,0.4)", "0 0 0px rgba(10,10,10,0)"]
  );
  // Both problems "converge" slightly as they scroll out, setting up the fix.
  const leftX = useTransform(scrollYProgress, [0.55, 1], [0, 14]);
  const rightX = useTransform(scrollYProgress, [0.55, 1], [0, -14]);

  const parallax = animate && !reduced;
  const HEAD = ["PUBLISHING IS BROKEN", "ON BOTH SIDES."];

  return (
    <section id="problem" ref={ref} className="relative px-5 py-24 sm:px-8 sm:py-32 lg:px-12">
      <div className="mx-auto max-w-[1180px]">
        {/* eyebrow */}
        <motion.p
          className={`${display} text-center text-[11px] font-medium uppercase tracking-[0.3em] text-[#0A0A0A]/60`}
          initial={animate ? { opacity: 0, y: 12 } : false}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.4, ease: EXPO }}
        >
          The Problem
        </motion.p>

        {/* headline (masked line reveal) */}
        <h2 className={`${display} mx-auto mt-5 max-w-4xl text-center font-black uppercase leading-[0.92] tracking-[-0.01em] text-[clamp(1.5rem,5.6vw,3.75rem)]`}>
          {HEAD.map((line, i) => (
            <span key={line} className="block overflow-hidden">
              <motion.span
                className="block will-change-transform"
                initial={animate ? { y: "110%" } : false}
                animate={inView ? { y: "0%" } : {}}
                transition={{ duration: 0.6, ease: EXPO, delay: animate ? 0.15 + i * 0.1 : 0 }}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </h2>

        {/* full-width rule */}
        <motion.div
          className="mt-12 h-px w-full origin-left"
          style={{ backgroundColor: INK }}
          initial={animate ? { scaleX: 0 } : false}
          animate={inView ? { scaleX: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.35, ease: EXPO }}
        />

        {/* two-column ledger */}
        <div className="relative mt-10 flex flex-col md:flex-row md:items-stretch">
          <motion.div className="flex-1" style={{ x: parallax ? leftX : 0 }}>
            <ProblemColumn data={COLUMNS[0]} inView={inView} animate={animate} reduced={reduced} side="left" />
          </motion.div>

          {/* mobile horizontal divider */}
          <div className="my-10 h-px w-full md:hidden" style={{ backgroundColor: INK }} />

          {/* desktop vertical divider (draws top→bottom, pulses at centre) */}
          <div className="relative hidden w-px self-stretch md:block">
            <motion.div
              className="h-full w-full origin-top"
              style={{
                backgroundColor: INK,
                scaleX: parallax ? pulseX : 1,
                boxShadow: parallax ? glow : undefined,
              }}
              initial={animate ? { scaleY: 0 } : false}
              animate={inView ? { scaleY: 1 } : {}}
              transition={{ duration: 0.8, delay: 0.45, ease: EXPO }}
            />
          </div>

          <motion.div className="flex-1" style={{ x: parallax ? rightX : 0 }}>
            <ProblemColumn data={COLUMNS[1]} inView={inView} animate={animate} reduced={reduced} side="right" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

// ===========================================================================
// SECTION 3 — THE WHALE CIRCLE (capture, then countermeasures)
// A single centered composition — no side text column. Type sits inside the
// ring's own empty middle, sandwiched between the WhaleCircle's back/front
// canvases so passing particles can occlude it, and crossfades from one
// stage's copy to the next in place as the sequence advances.
// ===========================================================================
const WHALE_INTRO = {
  eyebrow: "The whale problem",
  lines: ["TOKEN WEIGHT", "BECOMES A", "CLOSED LOOP."],
} as const;
const CM_TEXT = [
  {
    tag: "01 / VOTE CAPS",
    lines: ["MAX 5% POWER", "ON ANY POST."],
    small: "Vote your circle daily and returns diminish fast.",
  },
  {
    tag: "02 / AI COUNTERWEIGHT",
    lines: ["THE MODEL READS", "THE CONTENT."],
    small: "Coordinated voting patterns are detected and discounted.",
  },
  {
    tag: "03 / CLAPS DECIDE",
    lines: ["REACH ISN'T", "BOUGHT."],
    small: "Readers clap. Claps decide what surfaces. Tokens don't.",
  },
] as const;

function WhaleCenterBlock({
  opacity,
  y,
  eyebrow,
  lines,
  small,
}: {
  opacity: MotionValue<number>;
  y: MotionValue<number>;
  eyebrow: string;
  lines: readonly string[];
  small?: string;
}) {
  return (
    <motion.div
      className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
      style={{ opacity, y }}
    >
      <p className={`${display} text-[10px] font-medium uppercase tracking-[0.28em] text-[#0A0A0A]/60 sm:text-[11px]`}>
        {eyebrow}
      </p>
      <h2 className={`${display} mt-3 font-black uppercase leading-[0.96] tracking-[-0.02em] text-[clamp(1.4rem,3.6vw,2.4rem)]`}>
        {lines.map((line) => (
          <span key={line} className="block">
            {line}
          </span>
        ))}
      </h2>
      {small && (
        <p className="mt-3 max-w-[280px] text-[11.5px] leading-relaxed text-[#0A0A0A]/60">{small}</p>
      )}
    </motion.div>
  );
}

/** Pinned scroll-scrubbed sequence: rain → whale ring → three countermeasures
 * → distributed field. Text crossfades in the ring's center, keyed off the
 * exact same local progress the WhaleCircle canvas uses (from the section's
 * own box), so copy and visual advance and reverse together, 1:1 with scroll. */
function WhaleSectionAnimated() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const p = useTransform(scrollYProgress, [0, 0.85], [0, 1]);

  // Each block's fade-in/hold/fade-out window lines up exactly with the
  // canvas's own stage boundaries (ring-form 0.15–0.40, cm1/cm2/cm3, settle).
  const introOp = useTransform(p, [0.2, 0.3, 0.36, 0.4], [0, 1, 1, 0]);
  const introY = useTransform(p, [0.2, 0.3], [10, 0]);
  const cm1Op = useTransform(p, [0.4, 0.44, 0.52, 0.567], [0, 1, 1, 0]);
  const cm1Y = useTransform(p, [0.4, 0.44], [10, 0]);
  const cm2Op = useTransform(p, [0.567, 0.6, 0.69, 0.733], [0, 1, 1, 0]);
  const cm2Y = useTransform(p, [0.567, 0.6], [10, 0]);
  const cm3Op = useTransform(p, [0.733, 0.76, 0.86, 0.9], [0, 1, 1, 0]);
  const cm3Y = useTransform(p, [0.733, 0.76], [10, 0]);
  const closeOp = useTransform(p, [0.9, 0.96], [0, 1]);
  const closeY = useTransform(p, [0.9, 0.96], [12, 0]);

  return (
    // Tall scroll track; sticky wrapper holds the composition centered while
    // scroll drives the sequence, then releases at the closing beat.
    <section data-whale ref={ref} className="relative" style={{ height: "560vh" }}>
      <div className="sticky top-0 w-full overflow-hidden" style={{ height: "100svh", paddingTop: NAV_H }}>
        <div className="relative mx-auto h-full w-full max-w-[1600px]">
          <div className="pointer-events-none absolute inset-0" aria-hidden>
            <WhaleCircle still={false} />
          </div>

          <WhaleCenterBlock opacity={introOp} y={introY} eyebrow={WHALE_INTRO.eyebrow} lines={WHALE_INTRO.lines} />
          <WhaleCenterBlock opacity={cm1Op} y={cm1Y} eyebrow={CM_TEXT[0].tag} lines={CM_TEXT[0].lines} small={CM_TEXT[0].small} />
          <WhaleCenterBlock opacity={cm2Op} y={cm2Y} eyebrow={CM_TEXT[1].tag} lines={CM_TEXT[1].lines} small={CM_TEXT[1].small} />
          <WhaleCenterBlock opacity={cm3Op} y={cm3Y} eyebrow={CM_TEXT[2].tag} lines={CM_TEXT[2].lines} small={CM_TEXT[2].small} />

          <motion.div
            className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center px-6 text-center"
            style={{ opacity: closeOp, y: closeY }}
          >
            <p className={`${display} max-w-md font-black uppercase leading-snug tracking-tight text-[clamp(1.1rem,2.6vw,1.6rem)]`}>
              Weight doesn&apos;t decide what matters.
              <br />
              Readers do.
            </p>
            <a
              href="#"
              data-cursor
              className={`group pointer-events-auto mt-5 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.2em] ${display}`}
              style={{ color: INK }}
            >
              <span className="relative">
                Read the protocol
                <span
                  className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left transition-all duration-300 ease-out group-hover:h-[3px]"
                  style={{ backgroundColor: INK }}
                />
              </span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

/** Reduced-motion / pre-mount fallback: no pin, no scroll-scrub, no centered
 * ring — a static distributed field with all four text blocks stacked as a
 * plain, fully accessible list. */
function WhaleSectionStatic() {
  return (
    <section className="relative px-5 py-24 sm:px-8 sm:py-28 lg:px-12">
      <div className="mx-auto max-w-[900px] text-center">
        <p className={`${display} text-[10px] font-medium uppercase tracking-[0.3em] text-[#0A0A0A]/55 sm:text-[11px]`}>
          {WHALE_INTRO.eyebrow}
        </p>
        <h2 className={`${display} mx-auto mt-4 max-w-lg font-black uppercase leading-[0.94] tracking-[-0.02em] text-[clamp(1.6rem,4.4vw,2.75rem)]`}>
          {WHALE_INTRO.lines.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>

        <div className="mx-auto mt-10 max-w-lg text-left">
          {CM_TEXT.map((c, i) => (
            <div
              key={c.tag}
              className="grid grid-cols-[2.5rem_1fr] gap-3 border-t py-4 sm:grid-cols-[3rem_1fr]"
              style={{ borderColor: "rgba(10,10,10,0.14)" }}
            >
              <span
                className={`${display} block text-xl font-black tabular-nums sm:text-2xl`}
                style={{ WebkitTextStroke: `1.3px ${INK}`, color: "transparent" }}
              >
                {`0${i + 1}`}
              </span>
              <div>
                <h4 className={`${display} text-[13px] font-black uppercase leading-tight tracking-tight sm:text-sm`}>
                  {c.lines.join(" ")}
                </h4>
                <p className="mt-1.5 text-[12px] font-normal leading-relaxed text-[#0A0A0A]/60 sm:text-[12.5px]">
                  {c.small}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-8 max-w-lg border-t pt-6" style={{ borderColor: "rgba(10,10,10,0.14)" }}>
          <p className={`${display} text-base font-black uppercase leading-snug tracking-tight sm:text-lg`}>
            Weight doesn&apos;t decide what matters. Readers do.
          </p>
          <a
            href="#"
            className={`group mt-4 inline-flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.2em] ${display}`}
            style={{ color: INK }}
          >
            <span className="relative">
              Read the protocol
              <span
                className="absolute -bottom-1 left-0 h-[1.5px] w-full origin-left transition-all duration-300 ease-out group-hover:h-[3px]"
                style={{ backgroundColor: INK }}
              />
            </span>
            <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </a>
        </div>

        <div className="relative mx-auto mt-14 h-[38vh] min-h-[260px] w-full max-w-3xl">
          <WhaleCircle still />
        </div>
      </div>
    </section>
  );
}

function WhaleSection({ animate }: { animate: boolean }) {
  return animate ? <WhaleSectionAnimated /> : <WhaleSectionStatic />;
}

// ===========================================================================
// PAGE
// ===========================================================================
export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [fine, setFine] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  const animate = mounted && !reduced;
  const cursorOn = mounted && fine && !reduced;

  return (
    <main
      className={`relative w-full overflow-x-clip ${cursorOn ? "cursor-none" : ""}`}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      {/* One particle journey: hero cloud → rain → section-two globe (fixed layer) */}
      <CloudGlobe still={!animate} />

      <div className="relative z-10">
        <SiteNav animate={animate} />
        <Hero animate={animate} />
        <SignalSection animate={animate} />
        <WhaleSection animate={animate} />
        <ProblemSection animate={animate} reduced={reduced} />
      </div>

      {cursorOn && <CustomCursor />}
    </main>
  );
}
