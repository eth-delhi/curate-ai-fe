"use client";

import { AuthBackgroundAnimation } from "@/components/auth/BackgroundAnimation";
import { AuthForm } from "@/components/auth/AuthForm";
import { useMagicState } from "@/context/magic.provider";

export default function AuthPage() {
  const { token, setToken } = useMagicState();

  return (
    <div className="min-h-screen pt-20 bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb] relative overflow-hidden flex items-center justify-center">
      {/* Animated background */}
      <AuthBackgroundAnimation />

      {/* Auth form */}
      <AuthForm token={token} setToken={setToken} />
    </div>
  );
}
