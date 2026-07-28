"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { Mail, Loader2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Logo } from "@/components/ui/Logo";
import Navbar from "@/components/ui/Navbar";
import { TypingMessage } from "@/components/auth/TypingMessage";
import { useMagic } from "@/hooks/MagicProvider";
import { useMagicState } from "@/context/magic.provider";
import showToast from "@/utils/showToast";
import { RPCError, RPCErrorCode } from "magic-sdk";
import { useLogin } from "@/hooks/api/auth";
import { useRouter } from "next/navigation";

/** Follows the cursor and nudges toward it — used on the primary CTA. */
function Magnetic({ children }: { children: React.ReactNode }) {
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
        x.set((e.clientX - rect.left - rect.width / 2) * 0.2);
        y.set((e.clientY - rect.top - rect.height / 2) * 0.3);
      }}
      onMouseLeave={() => {
        x.set(0);
        y.set(0);
      }}
      style={{ x: springX, y: springY }}
    >
      {children}
    </motion.div>
  );
}

export default function AuthRevampPage() {
  const { token, setToken } = useMagicState();
  const { magic } = useMagic();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const [isGoogleLoginInProgress, setGoogleLoginInProgress] = useState(false);
  const { mutateAsync } = useLogin();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (token && token.length > 0) {
      router.push("/home");
    }
  }, [token, router]);

  // Show loading if already authenticated
  if (token && token.length > 0) {
    return (
      <div className="min-h-screen bg-background overflow-hidden relative">
        {/* Navbar */}
        <Navbar />

        {/* Loading Content */}
        <div className="min-h-screen flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="text-center"
          >
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-5" />
            <h2 className="text-xl font-serif font-semibold text-foreground min-h-[1.75rem]">
              <TypingMessage />
            </h2>
          </motion.div>
        </div>
      </div>
    );
  }

  const handleEmailLogin = async () => {
    if (
      !email.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      )
    ) {
      setEmailError(true);
      showToast({ message: "Please enter a valid email address", type: "error" });
      return;
    }

    if (!magic) {
      showToast({ message: "Still connecting — try again in a moment.", type: "error" });
      return;
    }

    setEmailError(false);
    setLoginInProgress(true);

    try {
      const didToken = await magic.auth.loginWithMagicLink({ email });
      if (!didToken) {
        showToast({ message: "Magic Link failed. Please try again.", type: "error" });
        return;
      }
      console.log("Magic Link sent successfully");

      const metadata = await magic.user.getInfo();

      // Create user in backend
      const response = await mutateAsync({
        token: didToken,
        email: email,
        walletAddress: metadata?.publicAddress as string,
      });

      if (response.success) {
        setToken(didToken);
        showToast({ message: "Magic Link sent! Check your email.", type: "success" });
        // Redirect will happen automatically due to useEffect
      } else {
        showToast({ message: "Failed to create user account", type: "error" });
      }
    } catch (error) {
      console.error("Magic Link login error:", error);
      if (error instanceof RPCError) {
        switch (error.code) {
          case RPCErrorCode.MagicLinkFailedVerification:
            showToast({ message: "Magic Link verification failed", type: "error" });
            break;
          case RPCErrorCode.MagicLinkExpired:
            showToast({ message: "Magic Link has expired", type: "error" });
            break;
          case RPCErrorCode.MagicLinkRateLimited:
            showToast({ message: "Too many requests. Please try again later.", type: "error" });
            break;
          default:
            showToast({ message: "Magic Link failed. Please try again.", type: "error" });
        }
      } else {
        showToast({ message: "An unexpected error occurred", type: "error" });
      }
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (!magic) {
      showToast({ message: "Still connecting — try again in a moment.", type: "error" });
      return;
    }

    setGoogleLoginInProgress(true);

    try {
      await magic.oauth.loginWithRedirect({
        provider: "google",
        redirectURI: `${window.location.origin}/auth/callback`,
      });
    } catch (error) {
      console.error("Google login error:", error);
      showToast({ message: "Google login failed. Please try again.", type: "error" });
      setGoogleLoginInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-background overflow-hidden relative">
      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-full px-4 sm:px-8 lg:px-16">
          <div className="w-full bg-background border border-border rounded-3xl shadow-sm overflow-hidden flex min-h-[700px]">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-5/12 p-8 md:p-16 flex flex-col justify-center">
              <div className="mb-10">
                <span className="font-mono text-xs tracking-widest text-primary uppercase">
                  Curate AI
                </span>
                <h1 className="text-3xl font-serif font-black mt-3 mb-2 text-foreground">
                  Welcome back.
                </h1>
                <p className="text-sm text-muted-foreground">
                  Sign in to keep curating, fairly.
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-8">
                <Button
                  variant="outline"
                  className="w-full h-11 justify-start text-left font-normal border-border hover:bg-accent bg-background text-foreground cursor-pointer transition-colors duration-150"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoginInProgress}
                >
                  <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.37-1.02 2.53-2.17 3.3v2.74h3.51c2.06-1.9 3.28-4.7 3.28-8.3z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.51-2.74c-1.01.68-2.3 1.09-3.77 1.09-2.89 0-5.33-1.95-6.2-4.57H2.18v2.88C4 20.36 7.74 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.8 14.06c-.22-.68-.35-1.41-.35-2.16s.13-1.48.35-2.16V6.86H2.18C1.44 8.3 1 9.97 1 11.9s.44 3.6 1.18 5.04l3.62-2.88z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 15.02 1 12 1 7.74 1 4 3.64 2.18 6.86l3.62 2.88c.87-2.62 3.31-4.57 6.2-4.57z"
                    />
                  </svg>
                  Continue with Google
                </Button>

                <Button
                  variant="outline"
                  className="w-full h-11 justify-start text-left font-normal border-border hover:bg-accent bg-background text-foreground cursor-pointer transition-colors duration-150"
                  disabled
                >
                  <svg
                    className="w-5 h-5 mr-3"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                  </svg>
                  Continue with Apple
                </Button>
              </div>

              <div className="relative mb-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-foreground mb-1.5"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 border-input focus:border-primary focus:ring-ring bg-background"
                    required
                  />
                  {emailError && (
                    <p className="text-destructive text-sm mt-1">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                <Magnetic>
                  <Button
                    onClick={handleEmailLogin}
                    disabled={isLoginInProgress}
                    className="w-full h-11 bg-primary hover:bg-primary/90 text-primary-foreground font-medium mt-6 transition-colors duration-150 cursor-pointer rounded-full group"
                  >
                    {isLoginInProgress ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="w-5 h-5 mr-2" />
                        Send Magic Link
                        <ArrowRight className="ml-1 w-4 h-4 transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </Button>
                </Magnetic>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-muted-foreground">
                  New to Curate AI?{" "}
                  <a
                    href="#"
                    className="text-primary font-medium hover:underline transition-colors duration-150"
                  >
                    Create account
                  </a>
                </p>
                <button
                  type="button"
                  onClick={() => router.push("/home")}
                  className="mt-3 text-xs text-muted-foreground hover:text-foreground underline transition-colors duration-150 cursor-pointer"
                >
                  Continue without logging in
                </button>
              </div>
            </div>

            <div className="hidden lg:block lg:w-7/12 relative overflow-hidden bg-muted">
              {/* Fine dot grid */}
              <div
                className="absolute inset-0 opacity-40"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(7,47,95,0.18) 1px, transparent 1px)",
                  backgroundSize: "22px 22px",
                }}
              />

              {/* Ambient drifting glow */}
              <motion.div
                className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl"
                animate={{ x: [0, -30, 0], y: [0, 20, 0] }}
                transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
              />
              <motion.div
                className="absolute bottom-0 left-0 w-72 h-72 rounded-full bg-primary/10 blur-3xl"
                animate={{ x: [0, 20, 0], y: [0, -20, 0] }}
                transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              />

              {/* Quadratic voting mock — reinforces what makes the platform different */}
              <div className="absolute top-16 left-12 right-12">
                <div className="bg-background/90 backdrop-blur-sm border border-border rounded-2xl p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
                      Live vote weight
                    </span>
                    <span className="flex items-center gap-1.5 font-mono text-[11px] text-primary">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-dot" />
                      Fair by design
                    </span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { label: "1 vote", cost: "1 CAT", width: "8%" },
                      { label: "5 votes", cost: "25 CAT", width: "42%" },
                      { label: "10 votes", cost: "100 CAT", width: "100%" },
                    ].map((row) => (
                      <div key={row.label} className="flex items-center gap-3 text-xs">
                        <span className="w-16 text-muted-foreground shrink-0">
                          {row.label}
                        </span>
                        <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: row.width }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                          />
                        </div>
                        <span className="w-16 text-right font-mono text-foreground shrink-0">
                          {row.cost}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Manifesto quote — grounded in the product's actual positioning */}
              <div className="absolute bottom-12 left-12 right-12">
                <div className="bg-background/90 backdrop-blur-sm border border-border rounded-2xl p-8 shadow-sm">
                  <blockquote className="space-y-4">
                    <p className="text-lg text-foreground leading-relaxed font-serif">
                      &ldquo;First platform where my following didn&apos;t
                      matter — the work did. Quadratic voting means one whale
                      account can&apos;t bury a hundred honest readers.&rdquo;
                    </p>
                    <footer className="flex items-center gap-3 pt-2">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                        <Logo className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          devansh.cat
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Early creator, Curate AI
                        </div>
                      </div>
                    </footer>
                  </blockquote>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
