"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import Navbar from "@/components/ui/Navbar";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowRight,
  Users,
  Shield,
  Zap,
  Globe,
  CheckCircle,
  Github,
  Twitter,
  MessageCircle,
  TrendingUp,
  Award,
  Brain,
  Lock,
  Star,
  Play,
  ChevronDown,
  AlertTriangle,
  Target,
  Eye,
  Layers,
  ChevronUp,
} from "lucide-react";

export default function LandingPage() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      // Show scroll to top button when scrolled past first page (100vh)
      setShowScrollTop(scrollTop > windowHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const problems = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: "Whale Dominance",
      description:
        "Large token holders manipulate rewards, drowning out genuine creators",
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Sybil Attacks",
      description: "Fake accounts and bot networks exploit voting mechanisms",
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: "Low-Quality Content",
      description: "Voting circles and spam degrade platform quality",
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: "Technical Barriers",
      description: "Complex onboarding prevents mainstream adoption",
    },
    {
      icon: <Brain className="w-8 h-8" />,
      title: "Opaque AI Governance",
      description: "Black-box algorithms create trust and fairness issues",
    },
  ];

  const solutions = [
    {
      icon: <Target className="w-6 h-6" />,
      title: "Quadratic Voting",
      description:
        "Prevents whale manipulation by making votes exponentially expensive",
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Reputation-Based Identity",
      description: "BrightID integration ensures one person, one vote",
    },
    {
      icon: <Eye className="w-6 h-6" />,
      title: "Transparent AI Scoring",
      description: "Open-source algorithms with explainable decision-making",
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Effortless Onboarding",
      description: "Web2-style login with Web3 benefits under the hood",
    },
  ];

  const tickerTexts = [
    "Fairness",
    "Transparency",
    "Community",
    "AI",
    "Decentralized",
    "Trust",
    "Equilibrium",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 overflow-hidden">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap");
        * {
          font-family: "Inter", sans-serif;
        }

        /* Custom scrollbar */
        ::-webkit-scrollbar {
          width: 6px;
        }
        ::-webkit-scrollbar-track {
          background: #f9f9f9;
        }
        ::-webkit-scrollbar-thumb {
          background: #333;
          border-radius: 3px;
        }

        /* Neural wave effect */
        .neural-wave {
          position: absolute;
          width: 2px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          pointer-events: none;
          animation: ripple 2s infinite;
        }

        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(20);
            opacity: 0;
          }
        }

        /* Glow effect */
        .glow {
          box-shadow: 0 0 20px rgba(255, 255, 255, 0.1);
        }

        /* Glass effect */
        .glass {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        /* Cyberpunk Effects */
        .cyber-border {
          position: relative;
        }
        .cyber-border::before {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border: 1px solid transparent;
          background: linear-gradient(45deg, #00ff00, #0080ff, #ff0080, #00ff00)
            border-box;
          border-radius: inherit;
          mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          mask-composite: exclude;
          opacity: 0.1;
        }

        .cyber-text {
          background: linear-gradient(45deg, #6b7280, #9ca3af, #d1d5db);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: cyber-gradient 6s ease infinite;
        }

        @keyframes cyber-gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        .cyber-grid {
          background-image: linear-gradient(
              rgba(0, 255, 0, 0.1) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(0, 255, 0, 0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        .cyber-pulse {
          animation: cyber-pulse 2s ease-in-out infinite;
        }

        @keyframes cyber-pulse {
          0%,
          100% {
            box-shadow: 0 0 2px rgba(0, 255, 0, 0.1);
          }
          50% {
            box-shadow: 0 0 8px rgba(0, 255, 0, 0.2),
              0 0 12px rgba(0, 255, 0, 0.1);
          }
        }

        .cyber-scroll {
          background: linear-gradient(
            90deg,
            transparent,
            rgba(0, 255, 0, 0.2),
            transparent
          );
          background-size: 200% 100%;
          animation: cyber-scroll 3s linear infinite;
        }

        @keyframes cyber-scroll {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }

        /* Hide scrollbar */
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        /* Added amoeba morphing animation */
        @keyframes amoeba-morph {
          0%,
          100% {
            border-radius: 60% 40% 30% 70% / 60% 30% 70% 40%;
          }
          25% {
            border-radius: 30% 60% 70% 40% / 50% 60% 30% 60%;
          }
          50% {
            border-radius: 50% 60% 30% 60% / 30% 60% 70% 40%;
          }
          75% {
            border-radius: 60% 40% 60% 40% / 70% 30% 50% 60%;
          }
        }

        .amoeba-shape {
          animation: amoeba-morph 20s ease-in-out infinite;
        }

        /* Ensure navbar stays fixed */
        nav {
          position: fixed !important;
          top: 0 !important;
          left: 0 !important;
          right: 0 !important;
          z-index: 9999 !important;
        }
      `}</style>

      {/* Neural Wave Background Effect */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="neural-wave"
          style={{
            left: mousePosition.x,
            top: mousePosition.y,
          }}
        />
      </div>

      {/* Navigation */}
      <Navbar />

      {/* Hero Section - Split Diagonal Layout */}
      <section className="min-h-screen flex flex-col lg:flex-row items-center relative overflow-hidden cyber-grid pt-8">
        {/* Left Half - Text */}
        <div className="w-full lg:w-1/2 h-full flex items-center justify-center px-4 sm:px-8 lg:px-16 py-16 lg:py-0">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-2xl text-center lg:text-left"
          >
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-black text-gray-900 leading-tight mb-6"
            >
              Rebuilding Trust in Content —{" "}
              <span className="cyber-text">With Blockchain and AI</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-lg sm:text-xl text-gray-600 mb-8 sm:mb-12 leading-relaxed"
            >
              A fair and transparent platform where every vote and creation
              matters.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center lg:justify-start"
            >
              <Button
                size="lg"
                className="cyber-border cyber-pulse bg-transparent border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold glow hover:glow-lg transition-all duration-300"
              >
                Join Waitlist
                <ArrowRight className="ml-2 w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="cyber-border bg-transparent border-2 border-gray-300 text-gray-700 hover:border-gray-900 hover:text-gray-900 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg font-semibold transition-all duration-300"
              >
                Explore the Vision
              </Button>
            </motion.div>
          </motion.div>
        </div>

        <div className="w-full lg:w-1/2 h-screen relative flex items-center justify-center overflow-hidden p-8 lg:p-16">
          {/* Amoeba-shaped container */}
          <div className="relative w-full h-full max-w-2xl max-h-[800px]">
            <div className="absolute inset-0 amoeba-shape bg-gradient-to-br from-gray-900 via-gray-800 to-black overflow-hidden shadow-2xl">
              {/* Neural Network Background */}
              <svg
                className="absolute inset-0 w-full h-full opacity-20"
                viewBox="0 0 400 400"
              >
                {[...Array(15)].map((_, i) => (
                  <motion.circle
                    key={`node-${i}`}
                    cx={50 + (i % 5) * 80}
                    cy={50 + Math.floor(i / 5) * 80}
                    r="3"
                    fill="rgba(255,255,255,0.6)"
                    animate={{
                      opacity: [0.3, 1, 0.3],
                      scale: [0.8, 1.2, 0.8],
                    }}
                    transition={{
                      duration: 2,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: i * 0.1,
                    }}
                  />
                ))}

                {/* Connection Lines */}
                {[...Array(20)].map((_, i) => (
                  <motion.line
                    key={`line-${i}`}
                    x1={50 + (i % 5) * 80}
                    y1={50 + Math.floor(i / 5) * 80}
                    x2={50 + ((i + 1) % 5) * 80}
                    y2={50 + Math.floor((i + 1) / 5) * 80}
                    stroke="rgba(255,255,255,0.3)"
                    strokeWidth="1"
                    animate={{
                      opacity: [0, 0.5, 0],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: i * 0.15,
                    }}
                  />
                ))}
              </svg>

              {/* Central AI Core */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  className="relative z-20"
                  animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                  }}
                >
                  <div className="relative">
                    {/* Outer Ring */}
                    <motion.div
                      className="w-24 h-24 border-2 border-gray-400 rounded-full"
                      animate={{
                        rotate: [0, -360],
                      }}
                      transition={{
                        duration: 8,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "linear",
                      }}
                    />

                    {/* Inner Core */}
                    <div className="absolute inset-2 w-20 h-20 bg-gradient-to-br from-gray-300 to-gray-600 rounded-full shadow-2xl">
                      <div className="absolute inset-3 bg-gradient-to-br from-gray-400 to-gray-700 rounded-full">
                        <div className="absolute inset-2 bg-gradient-to-br from-gray-500 to-gray-800 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Data Streams */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={`stream-${i}`}
                  className="absolute w-1 h-8 bg-gradient-to-t from-transparent to-gray-400"
                  style={{
                    left: `${20 + i * 5}%`,
                    top: `${10 + i * 7}%`,
                  }}
                  animate={{
                    y: [0, 300, 0],
                    opacity: [0, 1, 0],
                    scale: [0.5, 1, 0.5],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}

              {/* Floating Emotional Words */}
              {["FAIR", "EQUALITY", "TRUST", "FREEDOM", "JUSTICE", "HOPE"].map(
                (word, i) => (
                  <motion.div
                    key={`word-${i}`}
                    className="absolute text-gray-300 font-bold text-sm opacity-70"
                    style={{
                      left: `${15 + i * 15}%`,
                      top: `${20 + i * 12}%`,
                    }}
                    animate={{
                      y: [0, -30, 0],
                      opacity: [0.3, 0.9, 0.3],
                      rotate: [0, 3, 0],
                      scale: [0.9, 1.1, 0.9],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                      delay: i * 0.5,
                    }}
                  >
                    {word}
                  </motion.div>
                )
              )}

              {/* Background Grid */}
              <div className="absolute inset-0 opacity-5">
                <div
                  className="w-full h-full"
                  style={{
                    backgroundImage: `
                    linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
                  `,
                    backgroundSize: "30px 30px",
                  }}
                ></div>
              </div>
            </div>

            <div className="absolute inset-0 amoeba-shape bg-gradient-to-br from-gray-700/20 to-gray-900/20 blur-xl -z-10 scale-105"></div>
          </div>
        </div>
      </section>

      {/* The Problem - Cinematic Scroll Section */}
      <section
        id="problems"
        className="py-32 bg-gradient-to-br from-gray-50 to-white relative overflow-hidden"
      >
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100/20 to-transparent"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-black text-gray-900 mb-6">
              Where Web3 Content Platforms Went Wrong
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              System glitches that broke the promise of decentralized creativity
            </p>
          </motion.div>

          {/* Horizontal Scrolling Cards */}
          <div className="flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
            {problems.map((problem, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="flex-shrink-0 w-80 h-64 bg-white shadow-lg hover:shadow-2xl transition-all duration-300 p-8 relative overflow-hidden group cyber-border"
                style={{
                  transform: `rotate(${Math.sin(index) * 2}deg)`,
                  borderRadius: "30px 15px 30px 15px",
                  clipPath: "polygon(0% 0%, 100% 0%, 90% 100%, 10% 100%)",
                }}
                whileHover={{
                  scale: 1.02,
                  rotate: 0,
                  transition: { duration: 0.2 },
                }}
              >
                {/* Glitch Effect Background */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300">
                  <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 transform skew-x-12"></div>
                </div>

                <div className="relative z-10">
                  {/* Creative Visual Indicator */}
                  <div className="mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-gray-300 to-gray-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-gray-300 to-transparent"></div>
                    </div>
                  </div>

                  <h3 className="text-2xl font-black text-gray-900 mb-4 leading-tight">
                    {problem.title.split(" ").slice(0, 2).join(" ")}
                  </h3>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {problem.description}
                  </p>

                  {/* Subtle Status Indicator */}
                  <div className="mt-4 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-gray-500 font-medium">
                      SYSTEM ERROR
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Solution - Contrast Reveal Section */}
      <section
        id="solutions"
        className="py-32 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden"
      >
        {/* Neural Web Background */}
        <div className="absolute inset-0 opacity-20">
          <svg className="w-full h-full" viewBox="0 0 1000 1000" fill="none">
            <defs>
              <linearGradient
                id="neuralGradient"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.05)" />
              </linearGradient>
            </defs>
            <path
              d="M100 100 L300 200 L500 150 L700 250 L900 200"
              stroke="url(#neuralGradient)"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M100 300 L250 400 L400 350 L600 450 L800 400"
              stroke="url(#neuralGradient)"
              strokeWidth="1"
              fill="none"
            />
            <path
              d="M100 500 L200 600 L350 550 L500 650 L700 600"
              stroke="url(#neuralGradient)"
              strokeWidth="1"
              fill="none"
            />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
              Our Fix — Restoring Balance in Creation
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Interconnected solutions that restore fairness and transparency
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {solutions.map((solution, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="relative group"
              >
                {/* Connecting Lines */}
                {index < solutions.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-white/30 to-transparent z-0"></div>
                )}

                <div
                  className="bg-white/10 backdrop-blur-sm p-8 hover:bg-white/20 transition-all duration-300 group-hover:shadow-2xl relative z-10 overflow-hidden h-80 flex flex-col cyber-border"
                  style={{
                    borderRadius: "40px 20px 40px 20px",
                    clipPath: "polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)",
                  }}
                >
                  {/* Animated Background Pattern */}
                  <div className="absolute top-0 right-0 w-32 h-32 opacity-10 group-hover:opacity-20 transition-opacity duration-500">
                    <div className="w-full h-full bg-gradient-to-br from-white to-transparent rounded-full transform translate-x-8 -translate-y-8"></div>
                  </div>

                  {/* Solution Badge */}
                  <div className="relative mb-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 rounded-full border border-white/30">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-white font-medium tracking-wider">
                        SOLUTION
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                    {solution.title}
                  </h3>
                  <p className="text-gray-300 leading-relaxed text-sm mb-6 flex-1">
                    {solution.description}
                  </p>

                  {/* Progress Indicator */}
                  <div className="flex items-center gap-3 mt-auto">
                    <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-white/40 to-white/60 rounded-full"
                        initial={{ width: "0%" }}
                        whileInView={{ width: "100%" }}
                        transition={{ duration: 1.5, delay: index * 0.2 }}
                        viewport={{ once: true }}
                      />
                    </div>
                    <span className="text-xs text-white/70 font-mono">
                      ACTIVE
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Platform Experience - Immersive Flow */}
      <section
        id="experience"
        className="py-32 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden cyber-grid"
      >
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
              backgroundSize: "40px 40px",
            }}
          ></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">
              The Experience Flow
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three seamless steps that redefine content creation
            </p>
          </motion.div>

          {/* Flow Steps */}
          <div className="space-y-16">
            {[
              {
                step: "01",
                title: "Create",
                subtitle: "Upload & Tokenize",
                description:
                  "Transform your ideas into blockchain-secured content with AI-powered suggestions",
                color: "from-gray-600 to-gray-800",
                icon: "✍️",
              },
              {
                step: "02",
                title: "Curate",
                subtitle: "AI + Human Intelligence",
                description:
                  "Our transparent AI analyzes content while community members provide authentic feedback",
                color: "from-gray-700 to-gray-900",
                icon: "🧠",
              },
              {
                step: "03",
                title: "Earn",
                subtitle: "Fair Distribution",
                description:
                  "Quadratic voting ensures rewards flow to genuine creators, not whales",
                color: "from-gray-800 to-black",
                icon: "⚡",
              },
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -100 : 100 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                viewport={{ once: true }}
                className={`flex flex-col ${
                  index % 2 === 0 ? "lg:flex-row" : "lg:flex-row-reverse"
                } items-center gap-12`}
              >
                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center text-2xl`}
                    >
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-sm text-gray-400 font-mono tracking-wider mb-1">
                        STEP {item.step}
                      </div>
                      <h3 className="text-3xl font-black text-white">
                        {item.title}
                      </h3>
                      <p className="text-lg text-gray-300 font-medium">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>
                  <p className="text-gray-400 leading-relaxed text-lg">
                    {item.description}
                  </p>
                </div>

                {/* Visual Element */}
                <div className="flex-1 relative">
                  <div
                    className={`aspect-square bg-gradient-to-br ${item.color} rounded-3xl relative overflow-hidden cyber-border`}
                  >
                    {/* Animated Elements */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <motion.div
                        className="w-32 h-32 bg-white/20 rounded-full"
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [0.3, 0.6, 0.3],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </div>

                    {/* Floating Particles */}
                    {[...Array(6)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-2 h-2 bg-white/40 rounded-full"
                        style={{
                          left: `${20 + i * 15}%`,
                          top: `${30 + i * 10}%`,
                        }}
                        animate={{
                          y: [0, -20, 0],
                          opacity: [0.4, 1, 0.4],
                        }}
                        transition={{
                          duration: 2 + i * 0.3,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: i * 0.2,
                        }}
                      />
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* The Vision - Typography + Minimal Motion */}
      <section className="py-32 bg-gradient-to-br from-gray-900 to-black relative overflow-hidden cyber-grid">
        {/* Moving Light Gradient */}
        <div className="absolute inset-0 opacity-20">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h3 className="text-sm font-semibold text-gray-400 mb-8 tracking-widest uppercase">
              Our Ethos
            </h3>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            viewport={{ once: true }}
            className="space-y-8"
          >
            <motion.h2
              className="text-6xl lg:text-8xl font-black text-white leading-none cyber-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              FAIRNESS.
            </motion.h2>

            <motion.h2
              className="text-6xl lg:text-8xl font-black text-white leading-none cyber-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              viewport={{ once: true }}
            >
              TRANSPARENCY.
            </motion.h2>

            <motion.h2
              className="text-6xl lg:text-8xl font-black text-white leading-none cyber-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
            >
              EQUITY.
            </motion.h2>

            <motion.h2
              className="text-6xl lg:text-8xl font-black text-white leading-none cyber-text"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              viewport={{ once: true }}
            >
              THE INTERNET, RESET.
            </motion.h2>
          </motion.div>
        </div>
      </section>

      {/* Call to Action - Architectural Footer */}
      <section className="py-32 bg-gray-900 text-white relative overflow-hidden">
        {/* Vertical White Dividers */}
        <div className="absolute inset-0">
          <div className="absolute left-1/4 top-0 bottom-0 w-px bg-white/20"></div>
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/20"></div>
          <div className="absolute right-1/4 top-0 bottom-0 w-px bg-white/20"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl lg:text-7xl font-black mb-6">
              Join the Rebalance
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              Help redefine how AI and humans value creativity
            </p>

            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
              <Button
                size="lg"
                className="cyber-border cyber-pulse bg-white text-gray-900 hover:bg-gray-100 px-12 py-4 text-lg font-semibold glow"
              >
                Join Waitlist
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="cyber-border border-2 border-white text-white hover:bg-white hover:text-gray-900 px-12 py-4 text-lg font-semibold"
              >
                Read Whitepaper
              </Button>
            </div>

            {/* Social Icons */}
            <div className="flex justify-center space-x-8 mb-12">
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors hover:glow"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors hover:glow"
              >
                <Twitter className="w-6 h-6" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-white transition-colors hover:glow"
              >
                <MessageCircle className="w-6 h-6" />
              </a>
            </div>

            {/* Copyright */}
            <div className="text-gray-500 text-sm">
              © 2025 Curate AI — v0.9 (Beta)
            </div>
          </motion.div>
        </div>
      </section>

      {/* Scroll to Top Button */}
      <motion.button
        onClick={scrollToTop}
        className="fixed bottom-6 right-6 z-[9999] bg-gray-800 hover:bg-gray-900 text-white p-4 rounded-full shadow-xl border border-gray-600 hover:border-gray-500 transition-all duration-300 group"
        initial={{ opacity: 0, y: 20, scale: 0.8 }}
        animate={{
          opacity: showScrollTop ? 1 : 0,
          y: showScrollTop ? 0 : 20,
          scale: showScrollTop ? 1 : 0.8,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        whileHover={{
          scale: 1.05,
          y: -2,
          boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
        }}
        whileTap={{ scale: 0.95 }}
        style={{
          backdropFilter: "blur(10px)",
          backgroundColor: "rgba(31, 41, 55, 0.9)",
        }}
      >
        <motion.div
          animate={{
            y: [0, -1, 0],
            rotate: [0, -2, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <ChevronUp className="w-5 h-5" />
        </motion.div>

        {/* Subtle glow effect */}
        <motion.div
          className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10"
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0, 0.05, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />

        {/* Tooltip */}
        <div className="absolute bottom-full right-0 mb-3 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap pointer-events-none">
          Scroll to top
          <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
        </div>
      </motion.button>
    </div>
  );
}
