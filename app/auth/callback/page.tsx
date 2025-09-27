"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useMagic } from "@/hooks/MagicProvider";
import { showToast } from "@/utils/showToast";
import { useMagicState } from "@/context/magic.provider";
import Spinner from "@/components/ui/Spinner";
import { useLogin } from "@/hooks/api/auth";

const AuthCallback = () => {
  const { magic } = useMagic();
  const router = useRouter();

  const { setToken } = useMagicState();
  let called = false;

  const { mutateAsync } = useLogin();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        if (called) return;
        called = true;

        const result = await magic?.oauth.getRedirectResult();
        const token = result?.magic.idToken;
        const metadata = result?.oauth.userInfo;

        console.log("OAuth result:", result);
        console.log("Token:", token);
        console.log("Metadata:", metadata);

        if (!token || !metadata?.email || !metadata?.sub) {
          throw new Error("Google login failed");
        }

        // Get the actual wallet address from Magic user info
        const userInfo = await magic?.user.getInfo();
        console.log("Magic user info:", userInfo);

        if (!userInfo?.publicAddress) {
          throw new Error("Failed to get wallet address");
        }

        setToken(token);

        await mutateAsync({
          email: metadata.email,
          walletAddress: userInfo.publicAddress,
          token,
        });

        showToast({
          message: "Login successful",
          type: "success",
        });

        router.push("/home");
      } catch (e) {
        console.error("Callback error from:", e);
        showToast({
          message: "Failed to complete Google login. Please try again.",
          type: "error",
        });
        router.push("/auth");
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="mt-16">
      <Spinner />
    </div>
  );
};

export default AuthCallback;
