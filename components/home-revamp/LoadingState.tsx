"use client";

import { motion } from "framer-motion";
import { Logo } from "@/components/ui/Logo";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({
  message = "Loading posts...",
}: LoadingStateProps) => {
  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 1.4, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mb-4 w-10 h-10 text-primary"
        >
          <Logo className="w-10 h-10" />
        </motion.div>
        <p className="text-muted-foreground">{message}</p>
      </motion.div>
    </div>
  );
};
