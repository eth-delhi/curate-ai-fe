"use client";

import { Loader2 } from "lucide-react";
import { IoChevronUpCircle } from "react-icons/io5";
import { RightSidebarProps } from "@/types/home-revamp";
import { useAccount, useBalance } from "wagmi";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { useReadCuratAiTokenDecimals } from "@/hooks/wagmi/contracts";
import { contract } from "@/constants/contract";
import { formatUnits } from "viem";
import { useMemo } from "react";
import { useDailyVotePercentage } from "@/hooks/api/scores";

// Wallet Widget Component
const WalletWidget = () => {
  const { address, isConnected } = useAccount();
  const { balance: catBalance, isLoading: isCatBalanceLoading } =
    useCatTokenBalance();
  const { data: catDecimals } = useReadCuratAiTokenDecimals({
    address: contract.token as `0x${string}`,
  });
  const { data: sonicBalance, isLoading: isSonicBalanceLoading } = useBalance({
    address: address,
  });
  const { data: dailyVoteData, isLoading: isDailyVoteLoading } =
    useDailyVotePercentage(address || "");

  // Mock conversion rates
  const MOCK_CAT_USD_RATE = 0.15; // 1 CAT = $0.15
  const MOCK_SONIC_USD_RATE = 0.001; // 1 SONIC = $0.001

  const isLoading = isCatBalanceLoading || isSonicBalanceLoading;

  // Format CAT token balance with decimals
  const formattedCatBalance = useMemo(() => {
    if (!catBalance || !catDecimals) return "0.00";
    try {
      const formatted = formatUnits(catBalance, catDecimals);
      return parseFloat(formatted).toFixed(2);
    } catch {
      return "0.00";
    }
  }, [catBalance, catDecimals]);

  // Format Sonic balance (native token, always 18 decimals)
  const formattedSonicBalance = useMemo(() => {
    if (!sonicBalance?.value) return "0.00";
    try {
      const formatted = formatUnits(sonicBalance.value, 18);
      return parseFloat(formatted).toFixed(4);
    } catch {
      return "0.00";
    }
  }, [sonicBalance]);

  // Calculate USD values
  const catUsdValue = useMemo(() => {
    const value = parseFloat(formattedCatBalance) * MOCK_CAT_USD_RATE;
    return value.toFixed(2);
  }, [formattedCatBalance]);

  const sonicUsdValue = useMemo(() => {
    const value = parseFloat(formattedSonicBalance) * MOCK_SONIC_USD_RATE;
    return value.toFixed(2);
  }, [formattedSonicBalance]);

  if (!isConnected || !address) {
    return (
      <div>
        <h3 className="font-serif text-base font-semibold mb-4 text-foreground">Wallet & Balances</h3>
        <div className="border-l-2 border-border pl-4">
          <p className="text-[13px] text-muted-foreground">
            Connect your wallet to view balances.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h3 className="font-serif text-base font-semibold mb-4 text-foreground">Wallet & Balances</h3>
      <div className="border-l-2 border-border pl-4">
        {isLoading ? (
          <div className="flex items-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <p className="text-[13px] text-muted-foreground mb-1">Total Balance</p>
            <p className="text-[32px] font-semibold text-foreground mb-3">
              ${(Number(catUsdValue) + Number(sonicUsdValue)).toFixed(2)}
            </p>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-foreground">CAT</span>
              <span className="text-muted-foreground">{formattedCatBalance}</span>
            </div>
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-foreground">SONIC</span>
              <span className="text-muted-foreground">{formattedSonicBalance}</span>
            </div>
            <div className="h-px bg-border my-2" />
            <div className="flex justify-between py-1.5 text-sm">
              <span className="text-foreground flex items-center gap-1.5">
                <IoChevronUpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                Upvotes
              </span>
              <span className="text-muted-foreground">
                {isDailyVoteLoading
                  ? "..."
                  : dailyVoteData
                  ? `${dailyVoteData.totalVotePercentage} / 500`
                  : "0 / 500"}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export const LeftSidebar = ({
  onTopicClick,
  selectedTag,
}: Pick<RightSidebarProps, "onTopicClick"> & {
  selectedTag?: string | null;
}) => {
  void onTopicClick;
  void selectedTag;

  return (
    <div className="w-[220px] shrink-0">
      <WalletWidget />
    </div>
  );
};
