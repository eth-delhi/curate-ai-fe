"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/Logo";
import Navbar from "@/components/ui/Navbar";
import {
  motion,
  useInView,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  Github,
  MessageCircle,
  Twitter,
  ChevronUp,
  PenLine,
  Scale,
  Boxes,
  Coins,
} from "lucide-react";

// ---------------------------------------------------------------------------
// Small reusable interaction primitives
// ---------------------------------------------------------------------------

/** Follows the cursor and nudges toward it — used on primary CTAs. */
function Magnetic({
  children,
  strength = 0.35,
}: {
  children: React.ReactNode;
  strength?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 200, damping: 14, mass: 0.3 });
  const springY = useSpring(y, { stiffness: 200, damping: 14, mass: 0.3 });

  return (
    <motion.div
      ref={ref}
      onMouseMove={(e) => {
        const rect = ref.current?.getBoundingClientRect();
        if (!rect) return;
        x.set((e.clientX - rect.left - rect.width / 2) * strength);
        y.set((e.clientY - rect.top - rect.height / 2) * strength);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
}

/** Counts up from 0 once it scrolls into view. */
function CountUp({
  target,
  suffix = "",
  prefix = "",
  duration = 1.4,
}: {
  target: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let raf: number;
    let start: number | null = null;
    const step = (t: number) => {
      if (start === null) start = t;
      const progress = Math.min((t - start) / (duration * 1000), 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) raf = requestAnimationFrame(step);
      else setValue(target);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [inView, target, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/** Word-by-word opacity wipe scrubbed by scroll position, not viewport entry. */
function ScrollRevealText({
  text,
  className = "",
}: {
  text: string;
  className?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start 0.85", "start 0.35"],
  });
  const words = text.split(" ");

  return (
    <p ref={ref} className={className}>
      {words.map((word, i) => {
        const start = i / words.length;
        const end = start + 1 / words.length;
        return (
          <RevealWord
            key={i}
            word={word}
            progress={scrollYProgress}
            range={[start, end]}
          />
        );
      })}
    </p>
  );
}

function RevealWord({
  word,
  progress,
  range,
}: {
  word: string;
  progress: MotionValue<number>;
  range: [number, number];
}) {
  const opacity = useTransform(progress, range, [0.12, 1]);
  return (
    <motion.span style={{ opacity }} className="mr-[0.28em] inline-block">
      {word}
    </motion.span>
  );
}

/** Pins a card in place while the next one scrolls over it, shrinking behind. */
function StackCard({
  index,
  children,
}: {
  index: number;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [1, 0.9]);
  const opacity = useTransform(scrollYProgress, [0, 0.8, 1], [1, 1, 0.4]);

  return (
    <div
      ref={ref}
      className="sticky"
      style={{ top: `${104 + index * 14}px` }}
    >
      <motion.div style={{ scale, opacity }}>{children}</motion.div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const problems = [
  {
    tag: "01 — WHALES",
    title: "Whale-dominated rewards",
    description:
      "In a one-token-one-vote system, a handful of large holders decide what everyone else sees. Genuine creators get drowned out by capital, not merit.",
  },
  {
    tag: "02 — SYBILS",
    title: "Sybil-farmed engagement",
    description:
      "Bot networks and throwaway accounts inflate signal cheaply. Platforms end up optimizing for whoever can spin up the most fake identities.",
  },
  {
    tag: "03 — VOTE RINGS",
    title: "Low-quality vote circles",
    description:
      "Reciprocal upvote groups reward participation in the ring, not the work. Quality content with no clique gets buried on page one.",
  },
  {
    tag: "04 — FRICTION",
    title: "Wallets before words",
    description:
      "Seed phrases and gas fees before a single post. Most creators bounce before they ever get to make something.",
  },
  {
    tag: "05 — BLACK BOX",
    title: "Opaque AI moderation",
    description:
      "Scores appear from nowhere, with no way to see the reasoning or challenge the call. Trust erodes when the machine won't show its work.",
  },
];

const solutions = [
  {
    n: "01",
    title: "Quadratic voting",
    description:
      "Vote cost scales with the square of vote weight, so out-shouting the crowd gets exponentially expensive. Conviction matters more than balance.",
    span: "lg:col-span-2",
  },
  {
    n: "02",
    title: "Reputation-based identity",
    description: "BrightID-verified humans. One person, one voice.",
    span: "",
  },
  {
    n: "03",
    title: "Transparent scoring",
    description: "Open-source AI models. Every score is inspectable.",
    span: "",
  },
  {
    n: "04",
    title: "Effortless onboarding",
    description:
      "Sign in like it's 2015. Web3 guarantees run underneath without ever asking for a seed phrase up front.",
    span: "lg:col-span-2",
  },
];

const pillars = [
  {
    icon: PenLine,
    tag: "Written content",
    title: "For the written word",
    description:
      "Long reads, sharp takes, real reporting. A home for writing people actually finish — not thumb-stopping noise.",
  },
  {
    icon: Scale,
    tag: "Fair",
    title: "Fair by design",
    description:
      "Quadratic voting makes shouting expensive. Conviction beats capital, so the best writing rises — not the richest wallet.",
  },
  {
    icon: Boxes,
    tag: "Blockchain",
    title: "Proof on-chain",
    description:
      "Every post, vote, and score is written to the chain — inspectable, permanent, and impossible to quietly rewrite.",
  },
  {
    icon: Coins,
    tag: "Source of income",
    title: "Words that pay",
    description:
      "Great writing earns CAT. Turn the hours you already spend writing into income you actually own.",
  },
];

const flowSteps = [
  {
    step: "01",
    title: "Create",
    subtitle: "Upload & tokenize",
    description:
      "Publish content that's secured on-chain from the first draft, with AI-assisted tagging so it finds the right audience immediately.",
  },
  {
    step: "02",
    title: "Curate",
    subtitle: "AI + human signal",
    description:
      "A transparent scoring model reads the work while real, reputation-checked humans weigh in — no black box, no bot farms.",
  },
  {
    step: "03",
    title: "Earn",
    subtitle: "Fair distribution",
    description:
      "Quadratic-weighted rewards flow to whoever earned the attention, not whoever bought the most votes.",
  },
];

const tickerWords = [
  "FAIRNESS",
  "TRANSPARENCY",
  "QUADRATIC VOTING",
  "OPEN SCORING",
  "NO WHALES",
  "NO BOTS",
  "SONIC TESTNET",
  "CAT TOKEN",
];

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function LandingPage() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [spotlight, setSpotlight] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();
  const progressBarWidth = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });

  useEffect(() => {
    const handleMove = (e: MouseEvent) =>
      setSpotlight({ x: e.clientX, y: e.clientY });
    const handleScroll = () => setShowScrollTop(window.scrollY > window.innerHeight * 0.6);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="landing min-h-screen bg-background overflow-x-hidden">
      {/* Scroll progress bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] bg-primary origin-left z-[10000]"
        style={{ scaleX: progressBarWidth }}
      />

      {/* Cursor-following spotlight wash */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] transition-opacity duration-300"
        style={{
          background: `radial-gradient(500px circle at ${spotlight.x}px ${spotlight.y}px, rgba(10,10,10,0.04), transparent 70%)`,
        }}
      />

      <Navbar />

      {/* ---------------------------------------------------------------- */}
      {/* HERO */}
      {/* ---------------------------------------------------------------- */}
      <section className="relative overflow-hidden min-h-screen px-4 sm:px-8 lg:px-16">
        {/* Curation lens — a full-bleed field of writing that your cursor
            reveals and scores in real time. This is the signature moment. */}
        <CurationLens />
        <div className="relative z-20 flex min-h-screen flex-col justify-center pt-24 pb-16">
          {/* Headline block — full-bleed, oversized */}
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 font-mono text-xs tracking-widest text-muted-foreground mb-8 uppercase"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
              Live on Sonic testnet — v0.9 beta
              <span className="animate-blink-caret">_</span>
            </motion.div>

            <h1 className="font-sans font-black text-foreground leading-[0.85] text-[clamp(3rem,11.5vw,10.5rem)] -tracking-[0.04em]">
              {["Content has", "a trust", "problem."].map((line, i) => (
                <motion.span
                  key={line}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 + i * 0.1 }}
                  className="block"
                >
                  {line}
                </motion.span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8 text-xl text-muted-foreground max-w-xl leading-relaxed"
            >
              We&apos;re fixing it with math, not marketing. Quadratic voting
              and open-source AI scoring decide what rises — not whale
              wallets, not bot farms.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.65 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Magnetic>
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 py-6 text-base font-semibold group"
                >
                  Join Waitlist
                  <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </Magnetic>
              <Magnetic strength={0.25}>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-2 border-border text-foreground hover:border-primary hover:text-primary rounded-full px-8 py-6 text-base font-semibold"
                  onClick={() =>
                    document
                      .getElementById("problems")
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                >
                  See the fix
                </Button>
              </Magnetic>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="mt-16 grid grid-cols-3 gap-6 max-w-md border-t border-border pt-8"
            >
              <div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
                  <CountUp target={1204} suffix="+" />
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Waitlisted
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
                  <CountUp target={0} prefix="$" />
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Gas to vote
                </div>
              </div>
              <div>
                <div className="font-mono text-2xl sm:text-3xl font-bold text-foreground">
                  <CountUp target={100} suffix="%" />
                </div>
                <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
                  Open scoring
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* MARQUEE */}
      {/* ---------------------------------------------------------------- */}
      <div className="border-y border-border py-4 -rotate-1 bg-muted overflow-hidden marquee-group">
        <div className="flex whitespace-nowrap animate-marquee-left w-max">
          {[...tickerWords, ...tickerWords].map((word, i) => (
            <span
              key={i}
              className="mx-6 font-mono text-sm tracking-widest text-muted-foreground uppercase"
            >
              {word} <span className="text-primary">•</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------------------------------------------------------------- */}
      {/* PILLARS — the four ideas + mascot */}
      {/* ---------------------------------------------------------------- */}
      <section id="pillars" className="relative py-28 lg:py-36 px-4 sm:px-8 lg:px-16">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              What Curate is built on
            </span>
            <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-foreground mt-4 leading-[1.05]">
              Four ideas. One home for writing.
            </h2>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
              Meet the resident critic — a very serious cat who reads
              everything. Around it sit the four things Curate refuses to
              compromise on.
            </p>
          </div>

          <div className="grid lg:grid-cols-[0.85fr_1.15fr] gap-12 lg:gap-16 items-center">
            {/* Mascot character */}
            <motion.div
              initial={{ opacity: 0, scale: 0.94 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.7 }}
              className="relative mx-auto w-full max-w-sm"
            >
              <motion.img
                src="/curate-cat.svg"
                alt="The Curate cat — a scholarly mascot representing written content, fairness, blockchain and income"
                className="w-full h-auto select-none"
                draggable={false}
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              />
            </motion.div>

            {/* Pillar cards */}
            <div className="grid sm:grid-cols-2 gap-5">
              {pillars.map((p, i) => (
                <motion.div
                  key={p.tag}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-60px" }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                  className="group bg-background border border-border rounded-3xl p-7 transition-shadow hover:shadow-lg"
                >
                  <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center mb-5 group-hover:bg-primary transition-colors">
                    <p.icon className="w-5 h-5 text-primary group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                    {p.tag}
                  </span>
                  <h3 className="font-serif font-bold text-xl text-foreground mt-1 mb-2">
                    {p.title}
                  </h3>
                  <p className="text-muted-foreground text-[15px] leading-relaxed">
                    {p.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* PROBLEMS — stacked scroll cards */}
      {/* ---------------------------------------------------------------- */}
      <section id="problems" className="relative py-32 px-4 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto mb-20">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            The problem
          </span>
          <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-foreground mt-4 leading-[1.05]">
            Where Web3 content platforms went wrong.
          </h2>
        </div>

        <div className="max-w-4xl mx-auto space-y-10 pb-20">
          {problems.map((p, i) => (
            <StackCard key={p.title} index={i}>
              <div className="bg-background border border-border rounded-3xl p-8 sm:p-12 shadow-[0_1px_0_rgba(0,0,0,0.02)]">
                <div className="flex items-start justify-between gap-6 mb-6">
                  <span className="font-mono text-xs tracking-widest text-muted-foreground">
                    {p.tag}
                  </span>
                  <span className="font-mono text-xs text-border">
                    {String(i + 1).padStart(2, "0")} / {String(problems.length).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="font-serif font-bold text-3xl sm:text-4xl text-foreground mb-4">
                  {p.title}
                </h3>
                <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl">
                  {p.description}
                </p>
              </div>
            </StackCard>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* SOLUTIONS — bento grid */}
      {/* ---------------------------------------------------------------- */}
      <section id="solutions" className="py-32 px-4 sm:px-8 lg:px-16 bg-muted">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-2xl mb-16">
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              The fix
            </span>
            <h2 className="font-serif font-black text-4xl sm:text-5xl lg:text-6xl text-foreground mt-4 leading-[1.05]">
              Restoring balance in creation.
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {solutions.map((s, i) => (
              <motion.div
                key={s.n}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                whileHover={{ y: -4 }}
                className={`${s.span} bg-background border border-border rounded-3xl p-8 flex flex-col justify-between min-h-[220px] group transition-shadow hover:shadow-lg`}
              >
                <div className="flex items-start justify-between">
                  <span className="font-mono text-4xl font-bold text-border group-hover:text-primary/30 transition-colors">
                    {s.n}
                  </span>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-2xl text-foreground mb-2">
                    {s.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {s.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* EXPERIENCE FLOW — scroll-jacked horizontal panels */}
      {/* ---------------------------------------------------------------- */}
      <HorizontalFlow />

      {/* ---------------------------------------------------------------- */}
      {/* VISION — scroll-scrubbed manifesto */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-40 px-4 sm:px-8 lg:px-16">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            Our ethos
          </span>
          <ScrollRevealText
            text="We think the internet got the incentives backwards. Attention should follow quality, not capital. Trust should be earned through transparency, not assumed through branding. So we built a platform where every score can be inspected, every vote costs what it should, and every creator starts on equal footing — fairness, transparency, and equity, wired directly into the protocol."
            className="font-serif font-bold text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight mt-10"
          />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* QUADRATIC VOTING EXPLAINER */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-24 px-4 sm:px-8 lg:px-16 bg-muted">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-mono text-xs tracking-widest text-primary uppercase">
              The math
            </span>
            <h3 className="font-serif font-black text-3xl sm:text-4xl text-foreground mt-4 mb-6">
              Why one whale can&apos;t outvote a hundred creators.
            </h3>
            <p className="text-muted-foreground text-lg leading-relaxed">
              Vote cost grows with the square of your voting weight. Casting
              10x the votes doesn&apos;t cost 10x — it costs 100x. That single
              rule is what keeps reward distribution honest.
            </p>
          </div>
          <div className="bg-background border border-border rounded-3xl p-10 font-mono">
            <div className="flex items-baseline justify-center gap-3 text-3xl sm:text-4xl text-foreground mb-8">
              <span>cost</span>
              <span className="text-primary">=</span>
              <span>
                votes<sup className="text-primary">2</sup>
              </span>
            </div>
            <div className="space-y-3">
              {[
                { votes: 1, cost: 1 },
                { votes: 5, cost: 25 },
                { votes: 10, cost: 100 },
              ].map((row) => (
                <div
                  key={row.votes}
                  className="flex items-center gap-4 text-sm"
                >
                  <span className="w-16 text-muted-foreground">
                    {row.votes} vote{row.votes > 1 ? "s" : ""}
                  </span>
                  <div className="flex-1 h-2 bg-border rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-primary rounded-full"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${(row.cost / 100) * 100}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1, ease: "easeOut" }}
                    />
                  </div>
                  <span className="w-20 text-right text-foreground">
                    {row.cost} CAT
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      {/* CTA / FOOTER */}
      {/* ---------------------------------------------------------------- */}
      <section className="py-32 px-4 sm:px-8 lg:px-16 relative overflow-hidden">
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="font-serif font-black text-4xl sm:text-6xl lg:text-7xl text-foreground leading-[1.02] mb-8"
          >
            Join the rebalance.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-xl text-muted-foreground mb-12 max-w-xl mx-auto"
          >
            Help redefine how AI and humans value creativity — together.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center mb-20"
          >
            <Magnetic>
              <Button
                size="lg"
                className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-10 py-6 text-base font-semibold"
              >
                Join Waitlist
                <ArrowRight className="ml-1 w-4 h-4" />
              </Button>
            </Magnetic>
            <Magnetic strength={0.25}>
              <Button
                size="lg"
                variant="outline"
                className="border-2 border-border text-foreground hover:bg-background rounded-full px-10 py-6 text-base font-semibold"
              >
                Read Whitepaper
              </Button>
            </Magnetic>
          </motion.div>

          <div className="flex justify-center gap-8 mb-10">
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Github"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Twitter"
            >
              <Twitter className="w-5 h-5" />
            </a>
            <a
              href="#"
              className="text-muted-foreground hover:text-primary transition-colors"
              aria-label="Discord"
            >
              <MessageCircle className="w-5 h-5" />
            </a>
          </div>

          <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <Logo className="h-4 w-4" />
            Curate AI — v0.9 (Beta)
          </div>
        </div>
      </section>

      {/* Scroll to top */}
      <motion.button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-6 right-6 z-[9999] bg-primary text-primary-foreground p-4 rounded-full shadow-md"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          scale: showScrollTop ? 1 : 0.8,
          pointerEvents: showScrollTop ? "auto" : "none",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Scroll to top"
      >
        <ChevronUp className="w-5 h-5" />
      </motion.button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/**
 * Hero visual — "The Curation Lens." A full-bleed field of drifting writing on
 * paper. The cursor is a lens: words inside it sharpen and reveal a live score,
 * so quality rises to your attention while noise stays faint and sinks. Before
 * the visitor moves, the lens drifts on its own so the effect greets them.
 */
type LensToken = { t: string; s: number };

const lensWords: LensToken[] = [
  { t: "the essay that mattered", s: 96 },
  { t: "the truth, footnoted", s: 97 },
  { t: "quiet brilliance", s: 93 },
  { t: "proof on-chain", s: 95 },
  { t: "the buried lede", s: 91 },
  { t: "open scoring", s: 90 },
  { t: "paid to write", s: 92 },
  { t: "provenance", s: 89 },
  { t: "long read", s: 88 },
  { t: "authorship", s: 88 },
  { t: "conviction", s: 87 },
  { t: "reputation", s: 86 },
  { t: "peer review", s: 85 },
  { t: "field notes", s: 84 },
  { t: "the canon", s: 83 },
  { t: "the archive", s: 82 },
  { t: "manifesto", s: 81 },
  { t: "royalties", s: 80 },
  { t: "first draft", s: 79 },
  { t: "the dispatch", s: 78 },
  { t: "verified", s: 94 },
  { t: "signal", s: 90 },
  { t: "merit", s: 84 },
  { t: "the ledger", s: 73 },
  { t: "byline", s: 71 },
  { t: "footnote", s: 66 },
  { t: "prose", s: 64 },
  { t: "op-ed", s: 62 },
  { t: "$CAT", s: 85 },
  { t: "0x9f3c…a1", s: 76 },
  { t: "block #48210", s: 77 },
  // noise — stays faint, sinks, and gets a low score
  { t: "whale wallet", s: 14 },
  { t: "vote ring", s: 11 },
  { t: "sybil farm", s: 9 },
  { t: "bot swarm", s: 12 },
  { t: "spam", s: 8 },
  { t: "clickbait", s: 17 },
  { t: "engagement bait", s: 15 },
  { t: "throwaway alt", s: 13 },
  { t: "pump post", s: 19 },
  { t: "shill thread", s: 10 },
  { t: "astroturf", s: 12 },
  { t: "reply guy", s: 21 },
  { t: "copypasta", s: 16 },
  { t: "noise", s: 18 },
];

// Deterministic spread so the layout is stable between renders.
const lensRand = (n: number) => {
  const x = Math.sin(n * 99.13) * 10000;
  return x - Math.floor(x);
};

const LENS_RADIUS = 210;

function CurationLens() {
  const ref = useRef<HTMLDivElement>(null);
  const sizeRef = useRef({ w: 0, h: 0 });
  const interacted = useRef(false);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  const positions = useMemo(
    () =>
      lensWords.map((_, i) => {
        const cols = 8;
        const col = i % cols;
        const row = Math.floor(i / cols);
        const rows = Math.ceil(lensWords.length / cols);
        return {
          x: ((col + 0.5) / cols) * 100 + (lensRand(i + 1) - 0.5) * 9,
          y: ((row + 0.5) / rows) * 100 + (lensRand(i + 7) - 0.5) * 10,
        };
      }),
    []
  );

  useEffect(() => {
    const measure = () => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
    };
    measure();
    mx.set(sizeRef.current.w * 0.62);
    my.set(sizeRef.current.h * 0.5);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [mx, my]);

  // Idle drift until the visitor takes over.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    let raf = 0;
    let start: number | null = null;
    const loop = (ts: number) => {
      if (interacted.current) return;
      const { w, h } = sizeRef.current;
      if (w) {
        if (start === null) start = ts;
        const e = (ts - start) / 1000;
        mx.set(w * 0.6 + Math.cos(e * 0.45) * w * 0.2);
        my.set(h * 0.5 + Math.sin(e * 0.6) * h * 0.24);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mx, my]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      sizeRef.current = { w: r.width, h: r.height };
      interacted.current = true;
      mx.set(e.clientX - r.left);
      my.set(e.clientY - r.top);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <div
      ref={ref}
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      {lensWords.map((word, i) => (
        <LensWord
          key={i}
          word={word}
          pos={positions[i]}
          mx={mx}
          my={my}
          sizeRef={sizeRef}
        />
      ))}

      {/* The lens itself, following the cursor */}
      <motion.div className="absolute left-0 top-0" style={{ x: mx, y: my }}>
        <div
          className="-translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/10"
          style={{
            width: LENS_RADIUS * 2,
            height: LENS_RADIUS * 2,
            background:
              "radial-gradient(circle, rgba(255,255,255,0) 58%, rgba(230,229,224,0.28) 100%)",
            boxShadow: "0 30px 80px -40px rgba(0,0,0,0.25)",
          }}
        />
      </motion.div>
    </div>
  );
}

function LensWord({
  word,
  pos,
  mx,
  my,
  sizeRef,
}: {
  word: LensToken;
  pos: { x: number; y: number };
  mx: MotionValue<number>;
  my: MotionValue<number>;
  sizeRef: React.RefObject<{ w: number; h: number }>;
}) {
  const t = useTransform([mx, my], (latest) => {
    const [cx, cy] = latest as number[];
    const { w, h } = sizeRef.current ?? { w: 0, h: 0 };
    const wx = (pos.x / 100) * w;
    const wy = (pos.y / 100) * h;
    const d = Math.hypot(cx - wx, cy - wy);
    return Math.max(0, Math.min(1, 1 - d / LENS_RADIUS));
  });

  const tier = word.s >= 55 ? "up" : word.s <= 25 ? "down" : "mid";
  const opacity = useTransform(
    t,
    [0, 1],
    [0.11, tier === "up" ? 0.95 : tier === "down" ? 0.5 : 0.78]
  );
  const scale = useTransform(
    t,
    [0, 1],
    [1, tier === "up" ? 1.32 : tier === "down" ? 1.04 : 1.14]
  );
  const yShift = useTransform(
    t,
    [0, 1],
    [0, tier === "up" ? -7 : tier === "down" ? 7 : 0]
  );
  const badge = useTransform(t, [0.25, 0.7], [0, 1]);

  const phrase = word.t.includes(" ");
  const token = /[$#]|0x/.test(word.t);
  const fontSize = token ? 13 : phrase ? 19 : 16;
  const symbol = tier === "up" ? "✓" : tier === "down" ? "↓" : "·";

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
    >
      <motion.div
        className="relative whitespace-nowrap"
        style={{ opacity, scale, y: yShift }}
      >
        <span
          className={`${token ? "font-mono" : "font-serif"} ${
            tier === "up" ? "font-semibold" : "font-normal"
          } ${
            tier === "down"
              ? "line-through decoration-1 decoration-foreground/50"
              : ""
          } text-foreground`}
          style={{ fontSize }}
        >
          {word.t}
        </span>
        <motion.span
          className="absolute -right-5 -top-3 font-mono text-[10px] font-semibold text-foreground/70"
          style={{ opacity: badge }}
        >
          {symbol}
          {word.s}
        </motion.span>
      </motion.div>
    </div>
  );
}

function HorizontalFlow() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });
  const x = useTransform(
    scrollYProgress,
    [0, 1],
    ["0%", `-${(flowSteps.length - 1) * 100}%`]
  );

  return (
    <section
      id="experience"
      ref={containerRef}
      className="relative bg-background"
      style={{ height: `${flowSteps.length * 100}vh` }}
    >
      <div className="sticky top-0 h-screen overflow-hidden flex flex-col justify-center">
        <div className="px-4 sm:px-8 lg:px-16 mb-10">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            The experience flow
          </span>
          <h2 className="font-serif font-black text-4xl sm:text-5xl text-foreground mt-4">
            Three steps. No shortcuts for whales.
          </h2>
        </div>
        <motion.div style={{ x }} className="flex">
          {flowSteps.map((item) => (
            <div
              key={item.step}
              className="w-screen shrink-0 px-4 sm:px-8 lg:px-16"
            >
              <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
                <div>
                  <div className="font-mono text-7xl sm:text-8xl font-bold text-border mb-6">
                    {item.step}
                  </div>
                  <h3 className="font-serif font-black text-4xl sm:text-5xl text-foreground mb-2">
                    {item.title}
                  </h3>
                  <p className="text-lg text-muted-foreground font-medium mb-6">
                    {item.subtitle}
                  </p>
                  <p className="text-muted-foreground text-lg leading-relaxed max-w-md">
                    {item.description}
                  </p>
                </div>
                <div className="aspect-square bg-muted border border-border rounded-3xl relative overflow-hidden flex items-center justify-center">
                  <motion.div
                    className="w-40 h-40 rounded-full border-2 border-primary/30"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                  <motion.div
                    className="absolute w-24 h-24 rounded-full bg-primary/10"
                    animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0.2, 0.6] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut",
                      delay: 0.3,
                    }}
                  />
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
