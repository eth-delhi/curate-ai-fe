"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Brain, Mail, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/ui/Navbar";
import { useMagic } from "@/hooks/MagicProvider";
import { useMagicState } from "@/context/magic.provider";
import showToast from "@/utils/showToast";
import { RPCError, RPCErrorCode } from "magic-sdk";
import { useLogin } from "@/hooks/api/auth";
import { useRouter } from "next/navigation";

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
      router.push("/home-revamp");
    }
  }, [token, router]);

  // Show loading if already authenticated
  if (token && token.length > 0) {
    return (
      <div className="min-h-screen bg-neutral-50 overflow-hidden relative">
        {/* Navbar */}
        <Navbar />

        {/* Loading Content */}
        <div className="min-h-screen flex items-center justify-center pt-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <motion.div
              className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mx-auto mb-4"
              animate={{
                rotate: 360,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "linear",
              }}
            >
              <Brain className="w-8 h-8 text-white" />
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Already Authenticated
              </h2>
              <p className="text-gray-600">Redirecting to your dashboard...</p>
            </motion.div>
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
      showToast("Please enter a valid email address", "error");
      return;
    }

    setEmailError(false);
    setLoginInProgress(true);

    try {
      const didToken = await magic.auth.loginWithMagicLink({ email });
      console.log("Magic Link sent successfully");

      // Create user in backend
      const response = await mutateAsync({
        token: didToken,
        email: email,
      });

      if (response.success) {
        setToken(didToken);
        showToast("Magic Link sent! Check your email.", "success");
        // Redirect will happen automatically due to useEffect
      } else {
        showToast("Failed to create user account", "error");
      }
    } catch (error) {
      console.error("Magic Link login error:", error);
      if (error instanceof RPCError) {
        switch (error.code) {
          case RPCErrorCode.MagicLinkFailedVerification:
            showToast("Magic Link verification failed", "error");
            break;
          case RPCErrorCode.MagicLinkExpired:
            showToast("Magic Link has expired", "error");
            break;
          case RPCErrorCode.MagicLinkRateLimited:
            showToast("Too many requests. Please try again later.", "error");
            break;
          default:
            showToast("Magic Link failed. Please try again.", "error");
        }
      } else {
        showToast("An unexpected error occurred", "error");
      }
    } finally {
      setLoginInProgress(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoginInProgress(true);

    try {
      const didToken = await magic.oauth.loginWithRedirect({
        provider: "google",
        redirectURI: `${window.location.origin}/auth/callback`,
      });
    } catch (error) {
      console.error("Google login error:", error);
      showToast("Google login failed. Please try again.", "error");
      setGoogleLoginInProgress(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 overflow-hidden relative">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap");
        * {
          font-family: "Poppins", sans-serif;
        }

        /* Bubble animations */
        @keyframes bubbleFloat1 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          25% {
            transform: translateY(-10px) translateX(5px);
          }
          50% {
            transform: translateY(-5px) translateX(-3px);
          }
          75% {
            transform: translateY(-15px) translateX(8px);
          }
        }

        @keyframes bubbleFloat2 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          33% {
            transform: translateY(-8px) translateX(-4px);
          }
          66% {
            transform: translateY(-12px) translateX(6px);
          }
        }

        @keyframes bubbleFloat3 {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-6px) translateX(3px);
          }
        }

        .bubble-animate-1 {
          animation: bubbleFloat1 8s ease-in-out infinite;
        }

        .bubble-animate-2 {
          animation: bubbleFloat2 6s ease-in-out infinite;
          animation-delay: -2s;
        }

        .bubble-animate-3 {
          animation: bubbleFloat3 10s ease-in-out infinite;
          animation-delay: -4s;
        }
      `}</style>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="pt-20 min-h-screen flex items-center justify-center">
        <div className="w-full px-4 sm:px-8 lg:px-16">
          <div className="w-full bg-white rounded-3xl shadow-xl overflow-hidden flex min-h-[700px]">
            {/* Left Side - Login Form */}
            <div className="w-full lg:w-5/12 p-8 md:p-16 flex flex-col justify-center">
              <div className="mb-10">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-7 h-7 bg-black rounded flex items-center justify-center">
                    <span className="text-white text-xs font-bold">C</span>
                  </div>
                  <span className="text-lg font-semibold">CurateAi</span>
                </div>
                <h1 className="text-3xl font-semibold mb-2 text-neutral-900">
                  Welcome back
                </h1>
                <p className="text-sm text-neutral-500">
                  Sign in to continue to your account
                </p>
              </div>

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-8">
                <Button
                  variant="outline"
                  className="w-full h-11 justify-start text-left font-normal border-neutral-200 hover:bg-neutral-50 bg-white text-neutral-700 cursor-pointer"
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
                  className="w-full h-11 justify-start text-left font-normal border-neutral-200 hover:bg-neutral-50 bg-white text-neutral-700 cursor-pointer"
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
                  <div className="w-full border-t border-neutral-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-neutral-500">
                    Or continue with email
                  </span>
                </div>
              </div>

              {/* Form */}
              <div className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-medium text-neutral-700 mb-1.5"
                  >
                    Email address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full h-11 border-neutral-200 focus:border-neutral-900 focus:ring-neutral-900 bg-white"
                    required
                  />
                  {emailError && (
                    <p className="text-red-500 text-sm mt-1">
                      Please enter a valid email address
                    </p>
                  )}
                </div>

                <Button
                  onClick={handleEmailLogin}
                  disabled={isLoginInProgress}
                  className="w-full h-11 bg-neutral-900 hover:bg-neutral-800 text-white font-medium mt-6 transition-colors cursor-pointer"
                >
                  {isLoginInProgress ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Mail className="w-5 h-5 mr-2" />
                      Send Magic Link
                    </>
                  )}
                </Button>
              </div>

              {/* Footer */}
              <div className="mt-8 text-center">
                <p className="text-sm text-neutral-600">
                  New to CurateAi?{" "}
                  <a
                    href="#"
                    className="text-neutral-900 font-medium hover:underline"
                  >
                    Create account
                  </a>
                </p>
              </div>
            </div>

            <div className="hidden lg:block lg:w-7/12 relative overflow-hidden bg-white">
              {/* Halftone pattern background */}
              <div className="absolute inset-0">
                <svg
                  className="w-full h-full"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    {/* Create varying dot sizes for halftone effect */}
                    <radialGradient id="dotGrad1" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#000" stopOpacity="1" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="dotGrad2" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#000" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="dotGrad3" cx="50%" cy="50%">
                      <stop offset="0%" stopColor="#000" stopOpacity="0.5" />
                      <stop offset="100%" stopColor="#000" stopOpacity="0" />
                    </radialGradient>
                  </defs>

                  {/* Top left cluster - sparse */}
                  <g className="bubble-animate-1">
                    {Array.from({ length: 6 }).map((_, i) =>
                      Array.from({ length: 6 }).map((_, j) => {
                        const size = Math.random() * 6 + 3;
                        const opacity = Math.random() * 0.3 + 0.2;
                        return (
                          <circle
                            key={`tl-${i}-${j}`}
                            cx={i * 60 + Math.random() * 20}
                            cy={j * 60 + Math.random() * 20}
                            r={size}
                            fill="#000"
                            opacity={opacity}
                          />
                        );
                      })
                    )}
                  </g>

                  {/* Center - minimal dots */}
                  <g className="bubble-animate-2">
                    {Array.from({ length: 4 }).map((_, i) =>
                      Array.from({ length: 6 }).map((_, j) => {
                        const size = Math.random() * 8 + 4;
                        const opacity = Math.random() * 0.2 + 0.1;
                        return (
                          <circle
                            key={`c-${i}-${j}`}
                            cx={200 + i * 80 + Math.random() * 30}
                            cy={j * 80 + Math.random() * 30}
                            r={size}
                            fill="#000"
                            opacity={opacity}
                          />
                        );
                      })
                    )}
                  </g>

                  {/* Right side - very minimal */}
                  <g className="bubble-animate-3">
                    {Array.from({ length: 3 }).map((_, i) =>
                      Array.from({ length: 4 }).map((_, j) => {
                        const size = Math.random() * 12 + 6;
                        const opacity = Math.random() * 0.15 + 0.05;
                        return (
                          <circle
                            key={`r-${i}-${j}`}
                            cx={450 + i * 120 + Math.random() * 40}
                            cy={j * 120 + Math.random() * 40}
                            r={size}
                            fill="#000"
                            opacity={opacity}
                          />
                        );
                      })
                    )}
                  </g>

                  {/* Bottom accent - minimal */}
                  <g className="bubble-animate-1">
                    {Array.from({ length: 6 }).map((_, i) =>
                      Array.from({ length: 3 }).map((_, j) => {
                        const size = Math.random() * 6 + 3;
                        const opacity = Math.random() * 0.2 + 0.1;
                        return (
                          <circle
                            key={`b-${i}-${j}`}
                            cx={i * 100 + Math.random() * 30}
                            cy={500 + j * 80 + Math.random() * 30}
                            r={size}
                            fill="#000"
                            opacity={opacity}
                          />
                        );
                      })
                    )}
                  </g>
                </svg>
              </div>

              {/* Subtle gradient overlay for depth */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-white/60 pointer-events-none" />

              {/* Minimal content overlay */}
              <div className="absolute bottom-12 left-12 right-12">
                <div className="bg-white/80 backdrop-blur-sm border border-neutral-200 rounded-2xl p-8 shadow-lg">
                  <blockquote className="space-y-4">
                    <p className="text-lg text-neutral-900 leading-relaxed font-light">
                      "CurateAi has transformed how we discover and organize
                      content. The AI recommendations are incredibly accurate."
                    </p>
                    <footer className="flex items-center gap-3 pt-2">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 flex items-center justify-center text-white font-semibold text-sm">
                        SK
                      </div>
                      <div>
                        <div className="text-sm font-medium text-neutral-900">
                          Sarah Kim
                        </div>
                        <div className="text-xs text-neutral-500">
                          Content Director, TechFlow
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
