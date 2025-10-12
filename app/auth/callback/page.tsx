"use client";

import { useEffect } from "react";
import { useMagic } from "@/hooks/MagicProvider";
import { useMagicState } from "@/context/magic.provider";
import { useLogin } from "@/hooks/api/auth";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Brain, Loader2 } from "lucide-react";

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
          router.push("/home-revamp");
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-800 to-black flex items-center justify-center mx-auto mb-4"
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <Brain className="w-8 h-8 text-white" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Loader2 className="w-8 h-8 animate-spin text-gray-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Completing Authentication
          </h2>
          <p className="text-gray-600">
            Please wait while we verify your credentials...
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
