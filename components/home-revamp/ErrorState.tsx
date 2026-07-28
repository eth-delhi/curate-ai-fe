"use client";

import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface ErrorStateProps {
  error?: Error | null;
  message?: string;
}

export const ErrorState = ({
  error,
  message = "Failed to load posts",
}: ErrorStateProps) => {
  return (
    <div className="flex h-screen bg-background items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="text-center"
      >
        <AlertTriangle className="mx-auto mb-4 h-8 w-8 text-destructive" />
        <p className="text-destructive font-medium mb-1">{message}</p>
        <p className="text-muted-foreground text-sm">
          {error?.message || "An error occurred while fetching posts"}
        </p>
      </motion.div>
    </div>
  );
};
