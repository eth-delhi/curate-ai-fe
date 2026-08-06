"use client";

import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";

// In-place upvote-count animation shown after a successful upvote (replaces the
// old success toast). Anchored on the score number itself, given the count
// *before* the vote and the amount added:
//   1. the current count zooms up and drifts slightly higher       (phase 0)
//   2. it reads "<count> + <amount>" while held large              (phase 1)
//   3. it settles back down to the new total with a small,
//      monochrome (black/grey) burst                               (phase 2)
// onComplete fires when the sequence ends so the caller can refetch balance.
//
// It renders no width of its own — the caller overlays it, absolutely
// centered, on top of an invisible copy of the static count so the surrounding
// layout never shifts.

// Deliberately monochrome — subtle, not a party.
const BURST_COLORS = ["#1a1a1a", "#3f3f3f", "#5c5c5c", "#7a7a7a"];
const PIECE_COUNT = 14;

const SEQUENCE_S = 1.6;
const SHOW_SUM_MS = 360; // "10" -> "10 + 5"
const SETTLE_MS = 1000; // "10 + 5" -> "15" + burst
const DONE_MS = 1600;

interface UpvoteCountBurstProps {
  fromScore: number;
  amount: number;
  onComplete: () => void;
}

export function UpvoteCountBurst({
  fromScore,
  amount,
  onComplete,
}: UpvoteCountBurstProps) {
  // 0: "10"  ·  1: "10 + 5"  ·  2: "15"
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    const t1 = setTimeout(() => setPhase(1), SHOW_SUM_MS);
    const t2 = setTimeout(() => setPhase(2), SETTLE_MS);
    const t3 = setTimeout(onComplete, DONE_MS);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  // Small radial burst — computed once so it doesn't jitter on re-render.
  const pieces = useMemo(
    () =>
      Array.from({ length: PIECE_COUNT }).map((_, i) => {
        const angle =
          (Math.PI * 2 * i) / PIECE_COUNT + (Math.random() - 0.5) * 0.5;
        const distance = 16 + Math.random() * 24;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 6, // bias the spray slightly upward
          rotate: Math.random() * 220 - 110,
          color: BURST_COLORS[i % BURST_COLORS.length],
          size: 3 + Math.random() * 3,
          round: i % 2 === 0,
        };
      }),
    []
  );

  const total = fromScore + amount;

  return (
    <span className="relative inline-flex items-center justify-center whitespace-nowrap">
      {/* Monochrome burst — only mounts on the settle step */}
      {phase === 2 &&
        pieces.map((p) => (
          <motion.span
            key={p.id}
            className="pointer-events-none absolute left-1/2 top-1/2"
            style={{
              width: p.size,
              height: p.size,
              backgroundColor: p.color,
              borderRadius: p.round ? "9999px" : "1px",
            }}
            initial={{ opacity: 0, x: 0, y: 0, scale: 0, rotate: 0 }}
            animate={{
              opacity: [0, 1, 0],
              x: p.x,
              y: p.y,
              scale: [0, 1, 0.6],
              rotate: p.rotate,
            }}
            transition={{ duration: 0.6, ease: "easeOut", times: [0, 0.3, 1] }}
          />
        ))}

      {/* The count: zoom up + drift, then settle back down */}
      <motion.span
        className="inline-block font-semibold text-foreground"
        style={{ transformOrigin: "center bottom" }}
        initial={{ scale: 1, y: 0 }}
        animate={{ scale: [1, 1.6, 1.6, 1], y: [0, -12, -12, 0] }}
        transition={{
          duration: SEQUENCE_S,
          ease: [0.34, 1.56, 0.64, 1],
          times: [0, 0.24, 0.62, 1],
        }}
      >
        {phase === 0 && fromScore}
        {phase === 1 && (
          <>
            {fromScore}
            <span className="mx-0.5 text-muted-foreground">+</span>
            {amount}
          </>
        )}
        {phase === 2 && total}
      </motion.span>
    </span>
  );
}
