"use client";

/* =============================================================================
 * CURATE AI — sign-in. Standalone full-viewport screen, same monochrome
 * brutalist system as the landing. Exactly one action: Continue with Google
 * (wired to the existing Magic OAuth redirect). The sparseness is the design.
 * ========================================================================== */

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2, ArrowRight } from "lucide-react";
import { useMagic } from "@/hooks/MagicProvider";
import { useMagicState } from "@/context/magic.provider";
import { fetchUserInterests } from "@/hooks/api/tags";
import {
  hasSeenInterestsOnboarding,
  markInterestsOnboardingSeen,
} from "@/utils/onboarding";
import { captureReferralCodeFromUrl } from "@/utils/referral";
import {
  INK,
  PAPER,
  EXPO,
  display,
  AmbientDots,
  CustomCursor,
  NeuralCloud,
} from "@/components/brutal";

/**
 * First-time signups land on the interest picker once; returning users go
 * straight to the feed. (Unchanged behaviour — only the UI around it changed.)
 */
async function redirectAfterLogin(router: ReturnType<typeof useRouter>) {
  try {
    const { interests } = await fetchUserInterests();
    const hasInterests = (interests?.length ?? 0) > 0;
    if (!hasInterests && !hasSeenInterestsOnboarding()) {
      markInterestsOnboardingSeen();
      router.push("/onboarding/interests");
    } else {
      router.push("/home");
    }
  } catch {
    router.push("/home");
  }
}

/** Google "G" rendered in a single ink colour (inherits currentColor so it
 *  inverts with the button on hover). No brand colours. */
function GoogleG({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.37-1.02 2.53-2.17 3.3v2.74h3.51c2.06-1.9 3.28-4.7 3.28-8.3z" />
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.51-2.74c-1.01.68-2.3 1.09-3.77 1.09-2.89 0-5.33-1.95-6.2-4.57H2.18v2.88C4 20.36 7.74 23 12 23z" />
      <path d="M5.8 14.06c-.22-.68-.35-1.41-.35-2.16s.13-1.48.35-2.16V6.86H2.18C1.44 8.3 1 9.97 1 11.9s.44 3.6 1.18 5.04l3.62-2.88z" />
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 15.02 1 12 1 7.74 1 4 3.64 2.18 6.86l3.62 2.88c.87-2.62 3.31-4.57 6.2-4.57z" />
    </svg>
  );
}

export default function AuthPage() {
  const { token } = useMagicState();
  const { magic } = useMagic();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [mounted, setMounted] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [fine, setFine] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);

  useEffect(() => {
    setMounted(true);
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener?.("change", apply);
    setFine(window.matchMedia("(hover: hover) and (pointer: fine)").matches);
    return () => mq.removeEventListener?.("change", apply);
  }, []);

  // Preserve the referral code across the OAuth redirect round-trip.
  useEffect(() => {
    captureReferralCodeFromUrl(searchParams.get("ref"));
  }, [searchParams]);

  // Already signed in → move along.
  useEffect(() => {
    if (token && token.length > 0) redirectAfterLogin(router);
  }, [token, router]);

  const animate = mounted && !reduced;
  const cursorOn = mounted && fine && !reduced;

  const fail = () => {
    setError(true);
    setLoading(false);
    if (!reduced) {
      setShake(true);
      window.setTimeout(() => setShake(false), 240);
    }
  };

  const onGoogle = async () => {
    if (loading) return;
    setError(false);
    if (!magic) {
      fail();
      return;
    }
    setLoading(true);
    try {
      // Full-page redirect to Google; the app returns to /auth/callback.
      await magic.oauth.loginWithRedirect({
        provider: "google",
        redirectURI: `${window.location.origin}/auth/callback`,
      });
    } catch (e) {
      console.error("Google login error:", e);
      fail();
    }
  };

  // Signing-in state (already authenticated) — minimal, monochrome.
  if (token && token.length > 0) {
    return (
      <main className="relative min-h-[100svh] w-full overflow-hidden" style={{ backgroundColor: PAPER, color: INK }}>
        <AmbientDots still={!animate} />
        <div className="relative z-10 grid min-h-[100svh] place-items-center px-6">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-5 w-5 animate-spin" />
            <p className={`${display} text-[11px] font-medium uppercase tracking-[0.28em] text-[#0A0A0A]/70`}>
              Signing you in
            </p>
          </div>
        </div>
      </main>
    );
  }

  const subline = error
    ? "Something went wrong. Try again."
    : "Sign in with Google. That's the whole process.";

  return (
    <main
      className={`relative min-h-[100svh] w-full overflow-hidden ${cursorOn ? "cursor-none" : ""}`}
      style={{ backgroundColor: PAPER, color: INK }}
    >
      <AmbientDots still={!animate} />

      {/* Focal element — one instance of the hero's cloud, desktop only */}
      <motion.div
        className="pointer-events-none absolute inset-y-0 right-0 z-0 hidden w-[42%] lg:block"
        initial={animate ? { opacity: 0, scale: 0.92 } : false}
        animate={animate ? { opacity: 1, scale: 1 } : undefined}
        transition={animate ? { duration: 1, delay: 0.7, ease: EXPO } : undefined}
      >
        <NeuralCloud still={!animate} />
      </motion.div>

      {/* Top-left wordmark → home */}
      <a
        href="/"
        data-cursor
        aria-label="Back to home"
        className="absolute left-5 top-6 z-20 sm:left-8 lg:left-12"
      >
        <span
          className={`grid h-11 w-11 place-items-center text-center text-[10px] font-black uppercase leading-[0.82] tracking-tight ${display}`}
          style={{ backgroundColor: INK, color: PAPER }}
        >
          CURATE
          <br />
          AI
        </span>
      </a>

      {/* Top-right help */}
      <a
        href="mailto:support@curate.ai"
        data-cursor
        className={`group absolute right-5 top-8 z-20 inline-flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.2em] sm:right-8 lg:right-12 ${display}`}
        style={{ color: INK }}
      >
        Need help?
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
      </a>

      {/* Main block — left-aligned + slightly above centre on desktop */}
      <div className="relative z-10 mx-auto flex min-h-[100svh] w-full max-w-[1600px] flex-col justify-center px-6 sm:px-8 lg:px-12">
        <div className="w-full max-w-3xl text-center lg:-translate-y-[5vh] lg:text-left">
          <motion.p
            className={`${display} text-[11px] font-medium uppercase tracking-[0.3em] text-[#0A0A0A]/60`}
            initial={animate ? { opacity: 0, y: 10 } : false}
            animate={animate ? { opacity: 1, y: 0 } : undefined}
            transition={animate ? { duration: 0.3, ease: EXPO } : undefined}
          >
            Welcome back
          </motion.p>

          <h1 className={`${display} mt-4 font-black uppercase leading-[0.9] tracking-[-0.01em] text-[clamp(1.5rem,5vw,3.25rem)]`}>
            {["ONE ACCOUNT.", "EVERYTHING CURATED."].map((line, i) => (
              <span key={line} className="block overflow-hidden">
                <motion.span
                  className="block will-change-transform"
                  initial={animate ? { y: "110%" } : false}
                  animate={animate ? { y: "0%" } : undefined}
                  transition={animate ? { duration: 0.5, ease: EXPO, delay: 0.12 + i * 0.1 } : undefined}
                >
                  {line}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mx-auto mt-5 max-w-sm text-[13px] leading-relaxed text-[#0A0A0A]/60 lg:mx-0"
            initial={animate ? { opacity: 0 } : false}
            animate={animate ? { opacity: 1 } : undefined}
            transition={animate ? { duration: 0.4, delay: 0.5 } : undefined}
          >
            {subline}
          </motion.p>

          {/* The one action */}
          <motion.div
            className="mx-auto mt-9 w-full max-w-sm lg:mx-0"
            initial={animate ? { opacity: 0, scale: 0.96 } : false}
            animate={animate ? { opacity: 1, scale: 1 } : undefined}
            transition={animate ? { duration: 0.4, delay: 0.6, ease: EXPO } : undefined}
          >
            <motion.button
              type="button"
              onClick={onGoogle}
              disabled={loading}
              data-cursor
              aria-label="Continue with Google"
              animate={shake ? { x: [0, -2, 2, -2, 2, 0] } : { x: 0 }}
              transition={shake ? { duration: 0.24 } : { duration: 0 }}
              className="group relative flex h-14 w-full items-center justify-center gap-3 border-[1.5px] border-[#0A0A0A] bg-[#F5F4F0] text-[#0A0A0A] transition-colors duration-150 [transition-timing-function:linear] hover:bg-[#0A0A0A] hover:text-[#F5F4F0] disabled:cursor-default"
            >
              <span
                className={`flex items-center gap-3 transition-opacity duration-150 ${
                  loading ? "opacity-0" : "opacity-100"
                }`}
              >
                <GoogleG className="h-5 w-5" />
                <span className={`${display} text-[12px] font-bold uppercase tracking-[0.2em]`}>
                  Continue with Google
                </span>
              </span>
              {loading && (
                <span className="absolute inset-0 grid place-items-center">
                  <Loader2 className="h-5 w-5 animate-spin" />
                </span>
              )}
            </motion.button>
          </motion.div>

          <motion.p
            className={`${display} mx-auto mt-6 max-w-sm text-[9px] font-medium uppercase leading-[1.8] tracking-[0.14em] text-[#0A0A0A]/40 lg:mx-0`}
            initial={animate ? { opacity: 0 } : false}
            animate={animate ? { opacity: 1 } : undefined}
            transition={animate ? { duration: 0.4, delay: 0.75 } : undefined}
          >
            By continuing you agree to our{" "}
            <a href="#" className="underline underline-offset-2 transition-colors hover:text-[#0A0A0A]/80">
              Terms
            </a>{" "}
            and{" "}
            <a href="#" className="underline underline-offset-2 transition-colors hover:text-[#0A0A0A]/80">
              Privacy Policy
            </a>
            .
          </motion.p>
        </div>
      </div>

      {cursorOn && <CustomCursor />}
    </main>
  );
}
