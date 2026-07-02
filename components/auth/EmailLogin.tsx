"use client";

import { useState } from "react";
import { useMagic } from "@/hooks/MagicProvider";
import showToast from "@/utils/showToast";
import { RPCError, RPCErrorCode } from "magic-sdk";
import type { LoginProps } from "@/utils/types";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, Mail, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { useLogin } from "@/hooks/api/auth";

export const EmailLogin = ({ token, setToken }: LoginProps) => {
  const { magic } = useMagic();
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  const { mutateAsync } = useLogin();

  const handleLogin = async () => {
    if (
      !email.match(
        /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/
      )
    ) {
      setEmailError(true);
    } else {
      try {
        setLoginInProgress(true);
        setEmailError(false);

        const token = await magic?.auth.loginWithEmailOTP({ email });
        const metadata = await magic?.user.getInfo();

        await mutateAsync({
          token: token as string,
          email,
          walletAddress: metadata?.publicAddress as string,
        });

        if (!token || !metadata?.publicAddress) {
          throw new Error("Magic login failed");
        }

        setToken(token);
        setEmail("");
      } catch (e) {
        console.log("login error: " + JSON.stringify(e));
        if (e instanceof RPCError) {
          switch (e.code) {
            case RPCErrorCode.MagicLinkFailedVerification:
            case RPCErrorCode.MagicLinkExpired:
            case RPCErrorCode.MagicLinkRateLimited:
            case RPCErrorCode.UserAlreadyLoggedIn:
              showToast({ message: e.message, type: "error" });
              break;
            default:
              showToast({
                message: "Something went wrong. Please try again",
                type: "error",
              });
          }
        }
      } finally {
        setLoginInProgress(false);
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="space-y-5"
    >
      <div className="relative">
        <Input
          type="email"
          placeholder={token ? "Already logged in" : "Enter your email"}
          value={email}
          onChange={(e) => {
            if (emailError) setEmailError(false);
            setEmail(e.target.value);
          }}
          className="w-full h-14 pl-14 pr-4 text-foreground bg-background/90 border border-border rounded-xl focus:ring-2 focus:ring-ring focus:border-primary placeholder-muted-foreground shadow-sm"
          disabled={token.length > 0}
        />
        <Mail
          className="absolute left-5 top-1/2 transform -translate-y-1/2 text-primary"
          size={20}
        />
      </div>
      {emailError && (
        <motion.p
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-sm text-destructive mt-2 pl-4"
        >
          Please enter a valid email address
        </motion.p>
      )}
      <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
        <Button
          className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold rounded-xl transition-colors duration-200 ease-in-out shadow-md hover:shadow-lg"
          onClick={handleLogin}
          disabled={
            isLoginInProgress || (token.length > 0 ? false : email.length === 0)
          }
        >
          {isLoginInProgress ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Continue with Email
              <ArrowRight className="ml-2 h-5 w-5" />
            </>
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
};
