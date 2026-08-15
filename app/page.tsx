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
import { motion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import {
  INK,
  PAPER,
  EXPO,
  display,
  AmbientDots,
  CustomCursor,
  NeuralCloud,
  ParticleBirds,
  CloudGlobe,
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

function Hero({ animate }: { animate: boolean }) {
  const { scrollY } = useScroll();
  const headY = useTransform(scrollY, [0, 700], [0, -70]);
  const marqueeSeg = "BUILDING AI × WEB3";

  return (
    <section data-hero className="relative min-h-[100svh] w-full overflow-hidden">
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

      {/* Nav */}
      <header className="relative z-20 mx-auto flex w-full max-w-[1600px] items-center justify-between px-5 pt-6 sm:px-8 lg:px-12">
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
      </header>

      {/* Content */}
      <motion.div
        className="relative z-10 mx-auto flex min-h-[calc(100svh-88px)] w-full max-w-[1600px] flex-col justify-center px-5 pb-16 pt-10 sm:px-8 lg:px-12"
        style={{ y: animate ? headY : 0 }}
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
const SIGNAL_HEAD = ["EVERY IDEA", "DESERVES TO", "BE FOUND."];

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
      <AmbientDots still={!animate} />

      {/* One particle journey: hero cloud → rain → section-two globe (fixed layer) */}
      <CloudGlobe still={!animate} />

      <div className="relative z-10">
        <Hero animate={animate} />
        <SignalSection animate={animate} />
        <ProblemSection animate={animate} reduced={reduced} />
      </div>

      {cursorOn && <CustomCursor />}
    </main>
  );
}
