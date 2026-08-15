"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, Trophy, FileText } from "lucide-react";
import { CommentIcon, FlagIcon, ClapIcon, WalletIcon } from "@/components/icons";
import { display } from "@/components/brutal";
import { useAccount, useBalance } from "wagmi";
import {
  useReadCuratAiTokenBalanceOf,
  useReadCurateAiSettlementGetClaimableAmount,
  useWriteCurateAiSettlementClaimRewards,
} from "@/hooks/wagmi/contracts";
import { useContractAddresses } from "@/context/contractAddresses.provider";
import { RPC_POLL_INTERVAL_MS } from "@/constants/chain";
import { showToast } from "@/utils/showToast";
import { SuccessButton, useActionStatus } from "@/components/ui/SuccessButton";
import { formatUnits } from "viem";
import { useMemo } from "react";
import Link from "next/link";
import {
  useUserFollowers,
  useUserFollowing,
  FollowUser,
} from "@/hooks/api/follows";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/api/profile";

// Wallet Widget Component
//
// On the signed-in user's own profile this shows the connected wallet's
// balances plus claimable settlement rewards (with a claim action). When
// viewing someone else's profile it shows *that* account's on-chain balances
// (read-only, no claim) alongside their wallet address — on-chain balances are
// public, so the viewer doesn't need to be connected to see them.
const WalletWidget = ({
  walletAddress,
  isOwnProfile,
}: {
  walletAddress?: string;
  isOwnProfile: boolean;
}) => {
  const { address: connectedAddress } = useAccount();
  const { contracts } = useContractAddresses();

  // Whose balances to display: own profile → connected wallet; another
  // profile → that user's registered wallet address.
  const displayAddress = (
    isOwnProfile ? connectedAddress : walletAddress
  ) as `0x${string}` | undefined;

  const {
    data: catBalance,
    isLoading: isCatBalanceLoading,
    refetch: refetchCatBalance,
  } = useReadCuratAiTokenBalanceOf({
    address: contracts?.token as `0x${string}`,
    args: displayAddress ? [displayAddress] : undefined,
    query: {
      enabled: !!contracts && !!displayAddress,
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
  });
  const { data: sonicBalance, isLoading: isSonicBalanceLoading } = useBalance({
    address: displayAddress,
    query: {
      enabled: !!displayAddress,
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
  });

  // Mock conversion rates
  const MOCK_CAT_USD_RATE = 0.15;
  const MOCK_SONIC_USD_RATE = 0.001;

  const isLoading = isCatBalanceLoading || isSonicBalanceLoading;

  // CAT amounts are whole base units — the token contract mints/distributes
  // unscaled values (INITIAL_SUPPLY = 1_000_000_000, DAILY_MINT_AMOUNT =
  // 100_000), so the ERC20's 18 decimals are never used and must not be
  // applied when displaying.
  const catBalanceNumber = useMemo(
    () => (catBalance !== undefined ? Number(catBalance) : 0),
    [catBalance]
  );
  const formattedCatBalance = useMemo(
    () => catBalanceNumber.toLocaleString(),
    [catBalanceNumber]
  );

  const formattedSonicBalance = useMemo(() => {
    if (!sonicBalance?.value) return "0.00";
    try {
      const formatted = formatUnits(sonicBalance.value, 18);
      return parseFloat(formatted).toFixed(4);
    } catch {
      return "0.00";
    }
  }, [sonicBalance]);

  const catUsdValue = useMemo(() => {
    const value = catBalanceNumber * MOCK_CAT_USD_RATE;
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }, [catBalanceNumber]);

  const sonicUsdValue = useMemo(() => {
    const value = parseFloat(formattedSonicBalance) * MOCK_SONIC_USD_RATE;
    return value.toFixed(2);
  }, [formattedSonicBalance]);

  // Pending settlement rewards for this wallet. getClaimableAmount returns a
  // wei-scale (1e18) precision value; claimRewards() divides by 1e18 before
  // distributing, so mirror that here to show what would actually be paid out.
  const {
    data: claimableRaw,
    isLoading: isClaimableLoading,
    refetch: refetchClaimable,
  } = useReadCurateAiSettlementGetClaimableAmount({
    address: contracts?.settle as `0x${string}`,
    args: connectedAddress ? [connectedAddress] : undefined,
    query: {
      // Claimable rewards are only ever shown/claimed for the signed-in user's
      // own connected wallet.
      enabled: isOwnProfile && !!connectedAddress && !!contracts,
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
  });
  const { writeContractAsync: claimRewardsAsync, isPending: isClaiming } =
    useWriteCurateAiSettlementClaimRewards();
  const { status: claimStatus, run: runClaim } = useActionStatus();

  const claimableTokenUnits =
    claimableRaw !== undefined
      ? claimableRaw / BigInt(10) ** BigInt(18)
      : BigInt(0);

  // Like the balances above, the distributed amount is whole CAT base units.
  const formattedClaimable = useMemo(
    () => Number(claimableTokenUnits).toLocaleString(),
    [claimableTokenUnits]
  );

  const handleClaim = async () => {
    if (!contracts) {
      showToast({
        message: "Contract addresses not loaded yet. Please wait...",
        type: "error",
      });
      return;
    }
    try {
      await runClaim(async () => {
        await claimRewardsAsync({ address: contracts.settle as `0x${string}` });
        refetchClaimable();
        refetchCatBalance();
      });
    } catch (error) {
      console.error("Claim rewards failed:", error);
      showToast({
        message: "Failed to claim rewards. Please try again.",
        type: "error",
      });
    }
  };

  if (!displayAddress) {
    return (
      <div className="border-t border-[color:var(--border)] pt-5">
        <p className="text-[12px] text-[#0A0A0A]/55">
          {isOwnProfile
            ? "Connect your wallet to view balances."
            : "This user has no wallet address."}
        </p>
      </div>
    );
  }

  const shortAddress = `${displayAddress.slice(0, 6)}…${displayAddress.slice(-4)}`;

  return (
    <div className="border-t border-[color:var(--border)] pt-5">
      {isLoading ? (
        <div className="flex items-center justify-center py-2">
          <Loader2 className="w-4 h-4 animate-spin text-[#0A0A0A]/50" />
        </div>
      ) : (
        <div className="space-y-4">
          {/* Wallet address — attributed to the viewed account. */}
          {!isOwnProfile && (
            <div className="flex items-center gap-1.5 border-b border-[color:var(--border)] pb-3 text-[#0A0A0A]/55">
              <WalletIcon className="h-3.5 w-3.5" />
              <span className="font-mono text-[11px]">{shortAddress}</span>
            </div>
          )}

          {/* CAT balance */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0A0A0A]/55">
              CAT balance
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`${display} text-[26px] font-black leading-none tracking-tight text-[#0A0A0A] tabular-nums`}>
                {formattedCatBalance}
              </span>
              <span className="text-[11px] text-[#0A0A0A]/45">${catUsdValue}</span>
            </div>
          </div>

          {/* SONIC balance */}
          <div className="border-t border-[color:var(--border)] pt-4">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#0A0A0A]/55">
              SONIC balance
            </p>
            <div className="mt-1 flex items-baseline gap-2">
              <span className={`${display} text-[22px] font-black leading-none tracking-tight text-[#0A0A0A] tabular-nums`}>
                {formattedSonicBalance}
              </span>
              <span className="text-[11px] text-[#0A0A0A]/45">${sonicUsdValue}</span>
            </div>
          </div>

          {/* Claimable Rewards — only for the signed-in user's own wallet */}
          {isOwnProfile && (
            <div className="border-t border-[color:var(--border)] pt-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]/55">
                  Claimable rewards
                </span>
                <span className={`${display} text-[13px] font-bold text-[#0A0A0A] tabular-nums`}>
                  {isClaimableLoading ? "…" : `${formattedClaimable} CAT`}
                </span>
              </div>
              <SuccessButton
                onClick={handleClaim}
                disabled={isClaiming || !claimableRaw}
                status={claimStatus}
                loadingChildren={
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Claiming...
                  </>
                }
                className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-none border border-[#0A0A0A] bg-transparent px-2 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A] transition-colors duration-150 hover:bg-[#0A0A0A] hover:text-[#F5F4F0] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Claim Rewards
              </SuccessButton>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Helper function to get IPFS URL from hash
const getIpfsUrl = (hash?: string | null): string | null => {
  if (!hash) return null;
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

// User Item Component
const UserItem = ({ user }: { user: FollowUser }) => {
  const profilePicUrl = getIpfsUrl(user.profile?.profilePic);
  const displayName =
    user.profile?.fullName || user.email?.split("@")[0] || "User";
  const username =
    user.profile?.username ||
    `@${displayName.toLowerCase().replace(/\s+/g, ".")}`;

  // Generate consistent dummy profile picture based on name
  const nameHash = displayName
    .split("")
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const imgIndex = (nameHash % 70) + 1;
  const avatarUrl =
    profilePicUrl || `https://i.pravatar.cc/150?img=${imgIndex}`;

  return (
    <Link
      href={`/profile/${user.uuid}`}
      className="group flex items-center gap-2.5 py-2"
    >
      <Avatar className="h-8 w-8 flex-shrink-0">
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="bg-[#0A0A0A]/10 text-[11px] font-bold text-[#0A0A0A]">
          {displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#0A0A0A] underline-offset-4 group-hover:underline">
          {displayName}
        </p>
        <p className="truncate text-[11px] text-[#0A0A0A]/45">{username}</p>
      </div>
    </Link>
  );
};

interface ProfileLeftSidebarProps {
  userUuid: string;
  isOwnProfile: boolean;
}

// Stats Item Component
const StatItem = ({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  highlighted?: boolean;
  small?: boolean;
}) => (
  <div className="flex items-center justify-between border-b border-[color:var(--border)] py-2.5">
    <span className="flex items-center gap-2 text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/55">
      <Icon className="h-3.5 w-3.5 shrink-0 text-[#0A0A0A]/45" />
      {label}
    </span>
    <span className={`${display} text-[13px] font-bold text-[#0A0A0A] tabular-nums`}>
      {value}
    </span>
  </div>
);

export const ProfileLeftSidebar = ({
  userUuid,
  isOwnProfile,
}: ProfileLeftSidebarProps) => {
  const [activeTab, setActiveTab] = useState<"followers" | "following">(
    "followers"
  );

  // Fetch user profile for stats
  const { data: profileData } = useUserProfile(userUuid);

  // Fetch followers and following data
  const { data: followers = [], isLoading: isFollowersLoading } =
    useUserFollowers(userUuid);

  const { data: following = [], isLoading: isFollowingLoading } =
    useUserFollowing(userUuid);

  const followersCount = followers.length;
  const followingCount = following.length;

  // Stats from profile data
  const totalPosts = profileData?.stats?.postsCount || 0;
  const totalScores = profileData?.stats?.scoresCount || 0;
  const totalComments = profileData?.stats?.commentsCount || 0;
  const totalFlags = profileData?.stats?.flagsCount || 0;
  const totalClaps = profileData?.stats?.clapsCount || 0;

  return (
    <motion.aside
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="hidden lg:block w-[280px] shrink-0 self-start sticky top-[61px] py-8 pr-8"
    >
      <div className="space-y-6">
        {/* Wallet + Stats */}
        <div>
          <WalletWidget
            walletAddress={profileData?.walletAddress}
            isOwnProfile={isOwnProfile}
          />

          <div className="mt-6 border-t border-[color:var(--border)]">
            <StatItem icon={FileText} label="Total posts" value={totalPosts} />
            <StatItem icon={Trophy} label="Total scores" value={totalScores} />
            <StatItem icon={CommentIcon} label="Comments" value={totalComments} />
            <StatItem icon={FlagIcon} label="Flags" value={totalFlags} />
            <StatItem icon={ClapIcon} label="Claps" value={totalClaps} />
          </div>
        </div>

        {/* Followers/Following */}
        <div className="border-t border-border pt-6">
          {/* Tabs */}
          <div className="mb-4 flex gap-6 border-b border-[color:var(--border)]">
            {(["followers", "following"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={`relative py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors duration-150 ${
                  activeTab === t
                    ? "text-[#0A0A0A]"
                    : "text-[#0A0A0A]/45 hover:text-[#0A0A0A]"
                }`}
              >
                {t}
                {activeTab === t && (
                  <motion.div
                    layoutId="profile-sidebar-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A]"
                    transition={{ type: "spring", stiffness: 500, damping: 35 }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Count Display */}
          <div className="mb-4">
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#0A0A0A]/55">
              {activeTab === "followers"
                ? `${followersCount} ${
                    followersCount === 1 ? "Follower" : "Followers"
                  }`
                : `${followingCount} Following`}
            </span>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {activeTab === "followers" ? (
              isFollowersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : followers.length === 0 ? (
                <div className="py-12 text-center">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A]/45">
                    No followers yet
                  </p>
                </div>
              ) : (
                <div className="space-y-1">
                  {followers.map((user) => (
                    <UserItem key={user.uuid} user={user} />
                  ))}
                </div>
              )
            ) : isFollowingLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
              </div>
            ) : following.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A]/45">
                  Not following anyone yet
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {following.map((user) => (
                  <UserItem key={user.uuid} user={user} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.aside>
  );
};
