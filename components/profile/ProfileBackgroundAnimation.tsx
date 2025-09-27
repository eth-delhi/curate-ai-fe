"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Particle {
  id: number;
  x: number;
  y: number;
  size: number;
  speed: number;
  direction: number;
  opacity: number;
  color: string;
}

export const ProfileBackgroundAnimation = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate enhanced particles with vibrant colors
  useEffect(() => {
    const particleCount = 15;
    const vibrantColors = [
      "rgba(59, 130, 246, 0.2)", // Blue
      "rgba(99, 102, 241, 0.2)", // Indigo
      "rgba(139, 92, 246, 0.2)", // Purple
      "rgba(236, 72, 153, 0.2)", // Pink
      "rgba(14, 165, 233, 0.2)", // Sky
      "rgba(6, 182, 212, 0.2)", // Cyan
    ];

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 150 + 100, // Huge size (100-250px)
      speed: Math.random() * 0.05 + 0.01, // Very slow movement
      direction: Math.random() * 360,
      opacity: Math.random() * 0.15 + 0.05, // Very low opacity (0.05-0.2)
      color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            background: particle.color,
            filter: `blur(${particle.size / 4}px)`, // Heavy blur effect
          }}
          animate={{
            x: [
              0,
              Math.cos(particle.direction * (Math.PI / 180)) *
                100 *
                particle.speed,
              Math.cos(particle.direction * (Math.PI / 180)) *
                200 *
                particle.speed,
            ],
            y: [
              0,
              Math.sin(particle.direction * (Math.PI / 180)) *
                100 *
                particle.speed,
              Math.sin(particle.direction * (Math.PI / 180)) *
                200 *
                particle.speed,
            ],
            opacity: [
              particle.opacity,
              particle.opacity * 1.2,
              particle.opacity,
            ],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 30 + Math.random() * 40, // Very slow animation (30-70s)
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
            repeatType: "reverse",
          }}
        />
      ))}

      {/* Add animated gradient orbs */}
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 bg-gradient-to-r from-blue-400 to-purple-500"
        style={{ top: "10%", left: "5%", filter: "blur(80px)" }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 25,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      />

      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10 bg-gradient-to-r from-pink-400 to-blue-500"
        style={{ bottom: "15%", right: "10%", filter: "blur(100px)" }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, -70, 0],
          y: [0, 40, 0],
        }}
        transition={{
          duration: 30,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
          repeatType: "reverse",
        }}
      />
    </div>
  );
};
