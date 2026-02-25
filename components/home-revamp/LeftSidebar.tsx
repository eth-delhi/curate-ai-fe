"use client";

import { Wallet, Loader2 } from "lucide-react";
import { IoChevronUpCircle } from "react-icons/io5";
import { RightSidebarProps } from "@/types/home-revamp";
import { useAccount, useBalance } from "wagmi";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { useReadCuratAiTokenDecimals } from "@/hooks/wagmi/contracts";
import { contract } from "@/constants/contract";
import { formatUnits } from "viem";
import { useMemo } from "react";
import Link from "next/link";
import { useDailyVotePercentage } from "@/hooks/api/scores";
import { useTopTags } from "@/hooks/api/tags";
import { useAuth } from "@/hooks/useAuth";

const TopicItem = ({
  topic,
  onClick,
  isSelected,
}: {
  topic: string;
  onClick?: (topic: string) => void;
  isSelected?: boolean;
}) => (
  <Link
    href="#"
    onClick={(e) => {
      e.preventDefault();
      onClick?.(topic);
    }}
    className={`block py-2 hover:bg-gray-50 rounded px-1 transition-colors pl-2.5 ${
      isSelected ? "bg-gray-100 font-semibold" : ""
    }`}
  >
    <p className="text-sm text-gray-900 leading-snug lowercase">
      {topic.toLowerCase()}
    </p>
  </Link>
);

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
      <div className="mb-6">
        <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
          <p className="text-xs text-gray-500">
            Connect your wallet to view balances
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-3 border border-gray-200">
        {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-gray-500" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* CAT Balance */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">CAT</p>
                <p className="text-xs font-semibold text-gray-900">
                  ${catUsdValue}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {formattedCatBalance} CAT
              </p>
            </div>

            {/* Sonic Balance */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">SONIC</p>
                <p className="text-xs font-semibold text-gray-900">
                  ${sonicUsdValue}
                </p>
              </div>
              <p className="text-sm font-bold text-gray-900">
                {formattedSonicBalance} SONIC
              </p>
            </div>

            {/* Vote Balance - Subtle */}
            {isConnected && (
              <div className="pt-2.5 mt-2.5 border-t border-gray-200/60">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <IoChevronUpCircle className="w-3 h-3 text-gray-400" />
                      <p className="text-xs text-gray-500">Upvote Balance</p>
                    </div>
                    <p className="text-xs text-gray-500">
                      {isDailyVoteLoading
                        ? "..."
                        : dailyVoteData
                        ? `${dailyVoteData.totalVotePercentage} / 500`
                        : "0 / 500"}
                    </p>
                  </div>
                  <div className="w-full bg-gray-200/50 rounded-full h-1">
                    <div
                      className={`h-1 rounded-full transition-all duration-300 ${
                        isDailyVoteLoading
                          ? "bg-gray-300 animate-pulse"
                          : "bg-gray-400"
                      }`}
                      style={{
                        width: isDailyVoteLoading
                          ? "0%"
                          : dailyVoteData
                          ? `${Math.min(
                              (dailyVoteData.totalVotePercentage / 500) * 100,
                              100
                            )}%`
                          : "0%",
                      }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
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
  // Check if user is authenticated
  const { isAuthenticated } = useAuth();

  // Fetch top tags from API
  const { data: tagsData, isLoading: isTagsLoading } = useTopTags(
    { limit: 15 },
    { enabled: isAuthenticated }
  );

  // Extract tag names from API response
  const topics = useMemo(() => {
    if (!tagsData || tagsData.length === 0) return [];
    return tagsData.map((tag) => tag.name);
  }, [tagsData]);

  // Expand topics to fill the remaining height by repeating the list
  const expandedTopics = useMemo(() => {
    if (topics.length === 0) return [];
    const repeatCount = Math.ceil(25 / topics.length); // Repeat enough to fill screen
    return Array.from({ length: repeatCount }, () => topics).flat();
  }, [topics]);

  return (
    <div className="w-80 bg-white border-r border-gray-100 p-6 overflow-y-auto h-full flex flex-col">
      {/* Wallet Widget */}
      <WalletWidget />

      {/* Topics - fills remaining space */}
      <div className="flex-1 flex flex-col mt-6">
        <h3 className="text-sm font-bold text-gray-900 mb-2">#topics</h3>
        <p className="text-xs text-gray-600 mb-4">
          Trending topics for you to explore
        </p>
        {isTagsLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        ) : expandedTopics.length === 0 ? (
          <div className="text-xs text-gray-500 py-4">No topics available</div>
        ) : (
          <div className="space-y-1 border-l-2 border-gray-200 pl-2.5">
            {expandedTopics.map((topic, i) => (
              <TopicItem
                key={i}
                topic={topic}
                onClick={onTopicClick}
                isSelected={selectedTag?.toLowerCase() === topic.toLowerCase()}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
