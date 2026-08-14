"use client";

import { motion } from "framer-motion";
import { display } from "@/components/brutal";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({ message = "Loading posts" }: LoadingStateProps) => {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F4F0]">
      <div className="text-center">
        <motion.span
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className={`mx-auto mb-5 grid h-12 w-12 place-items-center text-center text-[11px] font-black uppercase leading-[0.82] tracking-tight ${display}`}
          style={{ backgroundColor: "#0A0A0A", color: "#F5F4F0" }}
        >
          CURATE
          <br />
          AI
        </motion.span>
        <p className="text-[10px] uppercase tracking-[0.22em] text-[#0A0A0A]/50">
          {message}
        </p>
      </div>
    </div>
  );
};
