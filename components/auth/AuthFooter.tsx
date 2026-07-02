"use client";

import { motion } from "framer-motion";

export const AuthFooter = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.7 }}
      className="mt-8"
    >
      <p className="text-sm text-muted-foreground text-center">
        By continuing, you agree to our{" "}
        <a href="#" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="#" className="text-primary hover:underline">
          Privacy Policy
        </a>
        .
      </p>
    </motion.div>
  );
};
