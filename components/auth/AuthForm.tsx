"use client";

import { motion } from "framer-motion";
import type { LoginProps } from "@/utils/types";
import { AuthHeader } from "./AuthHeader";
import { EmailLogin } from "./EmailLogin";
import { AuthDivider } from "./AuthDivider";
import { AuthFooter } from "./AuthFooter";
import GoogleLogin from "../magic/auth/GoogleLogin";

export const AuthForm = ({ token, setToken }: LoginProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full max-w-lg px-6 z-10"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <AuthHeader />

        <EmailLogin token={token} setToken={setToken} />

        <AuthDivider />

        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
          <GoogleLogin token={token} setToken={setToken} />
        </motion.div>

        <AuthFooter />
      </motion.div>
    </motion.div>
  );
};
