"use client";

import { useState } from "react";
import { useMagic } from "@/hooks/MagicProvider";
import { showToast } from "@/utils/showToast";
import { RPCError } from "magic-sdk";
import type { LoginProps } from "@/utils/types";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const GoogleLogin = ({ token }: LoginProps) => {
  const { magic } = useMagic();
  const [isLoginInProgress, setLoginInProgress] = useState(false);
  // const { mutateAsync } = useCreateUser();

  const handleGoogleLogin = async () => {
    try {
      setLoginInProgress(true);

      const result = await magic?.oauth.loginWithRedirect({
        provider: "google",
        redirectURI: window.location.origin + "/auth/callback",
      });
    } catch (e) {
      if (e instanceof RPCError) {
        showToast({ message: e.message, type: "error" });
      } else {
        showToast({
          message: "Google login failed. Please try again.",
          type: "error",
        });
      }
    } finally {
      setLoginInProgress(false);
    }
  };

  return (
    <Button
      className="w-full h-12 bg-white hover:bg-gray-100 text-gray-800 font-semibold border border-gray-300 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-white flex items-center justify-center"
      onClick={handleGoogleLogin}
      disabled={isLoginInProgress || token.length > 0}
    >
      {isLoginInProgress ? (
        <Loader2 className="h-5 w-5 animate-spin" />
      ) : (
        <>
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.51h5.84c-.25 1.37-1.02 2.53-2.17 3.3v2.74h3.51c2.06-1.9 3.28-4.7 3.28-8.3z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.51-2.74c-1.01.68-2.3 1.09-3.77 1.09-2.89 0-5.33-1.95-6.2-4.57H2.18v2.88C4 20.36 7.74 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.8 14.06c-.22-.68-.35-1.41-.35-2.16s.13-1.48.35-2.16V6.86H2.18C1.44 8.3 1 9.97 1 11.9s.44 3.6 1.18 5.04l3.62-2.88z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.46 2.09 15.02 1 12 1 7.74 1 4 3.64 2.18 6.86l3.62 2.88c.87-2.62 3.31-4.57 6.2-4.57z"
            />
          </svg>
          Continue with Google
        </>
      )}
    </Button>
  );
};

export default GoogleLogin;
