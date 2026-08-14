"use client";

import { motion } from "framer-motion";
import { display } from "@/components/brutal";

interface ErrorStateProps {
  error?: Error | null;
  message?: string;
}

export const ErrorState = ({
  error,
  message = "Failed to load posts",
}: ErrorStateProps) => {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F5F4F0] px-6">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <span className={`mx-auto mb-5 grid h-12 w-12 place-items-center border-[1.5px] border-[#0A0A0A] text-[22px] font-black text-[#0A0A0A] ${display}`}>
          !
        </span>
        <p className={`${display} text-[16px] font-black uppercase tracking-tight text-[#0A0A0A]`}>
          {message}
        </p>
        <p className="mt-2 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A]/50">
          {error?.message || "An error occurred while fetching posts"}
        </p>
      </motion.div>
    </div>
  );
};
