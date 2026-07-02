"use client";

import { motion } from "framer-motion";
import { Zap } from "lucide-react";

export const AuthHeader = () => {
  return (
    <>
      <div className="flex items-center justify-center mb-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-primary p-4 rounded-full shadow-lg"
        >
          <Zap className="h-8 w-8 text-primary-foreground" />
        </motion.div>
      </div>
      <motion.h2
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-3xl font-serif font-bold text-foreground mb-2 text-center"
      >
        Welcome To Curate AI
      </motion.h2>
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-muted-foreground text-center text-sm mb-8"
      >
        Sign in to access your account, create a post and access your wallet
      </motion.p>
    </>
  );
};
