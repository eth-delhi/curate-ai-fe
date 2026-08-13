"use client";

import { useEffect } from "react";
import { useMagic } from "@/hooks/MagicProvider";
import { useMagicState } from "@/context/magic.provider";
import { useLogin } from "@/hooks/api/auth";
import { fetchUserInterests } from "@/hooks/api/tags";
import {
  hasSeenInterestsOnboarding,
  markInterestsOnboardingSeen,
} from "@/utils/onboarding";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { INK, PAPER, display } from "@/components/brutal";
import {
  clearStoredReferralCode,
  getStoredReferralCode,
} from "@/utils/referral";

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
            referralCode: getStoredReferralCode(),
          });
          clearStoredReferralCode();

          setToken(result.magic.idToken as string);
          try {
            const { interests } = await fetchUserInterests();
            const hasInterests = (interests?.length ?? 0) > 0;
            if (!hasInterests && !hasSeenInterestsOnboarding()) {
              markInterestsOnboardingSeen();
              router.push("/onboarding/interests");
            } else {
              router.push("/home");
            }
          } catch {
            router.push("/home");
          }
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
    <main className="relative min-h-[100svh] w-full overflow-hidden" style={{ backgroundColor: PAPER, color: INK }}>
      <div className="relative z-10 grid min-h-[100svh] place-items-center px-6">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-5 w-5 animate-spin" />
          <p className={`${display} text-[11px] font-medium uppercase tracking-[0.28em] text-[#0A0A0A]/70`}>
            Finishing sign-in
          </p>
        </div>
      </div>
    </main>
  );
}
