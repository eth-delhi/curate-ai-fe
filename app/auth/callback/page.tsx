"use client";

import { useEffect } from "react";
import { useMagic } from "@/hooks/MagicProvider";
import { useMagicState } from "@/context/magic.provider";
import { useLogin } from "@/hooks/api/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { TypingMessage } from "@/components/auth/TypingMessage";

export default function AuthCallbackPage() {
  const { magic } = useMagic();
  const { setToken } = useMagicState();
  const { mutateAsync } = useLogin();
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const result = await magic?.oauth.getRedirectResult();

        if (result) {
          const metadata = await magic?.user.getInfo();

          await mutateAsync({
            token: result.magic.idToken as string,
            email: metadata?.email as string,
            walletAddress: metadata?.publicAddress as string,
          });

          setToken(result.magic.idToken as string);
          router.push("/home");
        } else {
          router.push("/auth");
        }
      } catch (error) {
        console.error("Callback error:", error);
        router.push("/auth");
      }
    };

    handleCallback();
  }, [magic, mutateAsync, setToken, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground mx-auto mb-5" />
        <h2 className="text-xl font-serif font-semibold text-foreground min-h-[1.75rem]">
          <TypingMessage />
        </h2>
      </motion.div>
    </div>
  );
}
