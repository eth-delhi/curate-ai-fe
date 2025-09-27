"use client";

import { useState, useEffect } from "react";

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

export const BackgroundAnimation = () => {
  const [particles, setParticles] = useState<Particle[]>([]);

  // Generate enhanced particles with vibrant colors
  useEffect(() => {
    const particleCount = 15;
    const vibrantColors = [
      "rgba(59, 130, 246, 0.2)",
      "rgba(99, 102, 241, 0.2)",
      "rgba(139, 92, 246, 0.2)",
      "rgba(236, 72, 153, 0.2)",
      "rgba(14, 165, 233, 0.2)",
      "rgba(6, 182, 212, 0.2)",
    ];

    const newParticles = Array.from({ length: particleCount }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 150 + 100,
      speed: Math.random() * 0.05 + 0.01,
      direction: Math.random() * 360,
      opacity: Math.random() * 0.15 + 0.05,
      color: vibrantColors[Math.floor(Math.random() * vibrantColors.length)],
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute rounded-full animate-pulse"
          style={{
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: particle.opacity,
            background: particle.color,
            filter: `blur(${particle.size / 4}px)`,
            animation: `float-${particle.id} ${
              30 + Math.random() * 40
            }s ease-in-out infinite`,
          }}
        />
      ))}

      <div
        className="absolute w-[400px] h-[400px] rounded-full opacity-20 bg-gradient-to-r from-blue-400 to-purple-500 animate-pulse"
        style={{
          top: "10%",
          left: "5%",
          filter: "blur(80px)",
          animation: "float-large 25s ease-in-out infinite",
        }}
      />

      <div
        className="absolute w-[500px] h-[500px] rounded-full opacity-10 bg-gradient-to-r from-pink-400 to-blue-500 animate-pulse"
        style={{
          bottom: "15%",
          right: "10%",
          filter: "blur(100px)",
          animation: "float-large-2 30s ease-in-out infinite",
        }}
      />

      <style jsx>{`
        @keyframes float-large {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(50px, 30px) scale(1.2);
          }
          66% {
            transform: translate(-30px, 20px) scale(0.9);
          }
        }

        @keyframes float-large-2 {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-70px, -40px) scale(1.3);
          }
          66% {
            transform: translate(40px, 25px) scale(0.8);
          }
        }
      `}</style>
    </div>
  );
};
