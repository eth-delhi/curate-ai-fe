"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Users, Trophy, FileText } from "lucide-react";
import { CommentIcon, FlagIcon, ClapIcon } from "@/components/icons";
import { useAccount, useBalance } from "wagmi";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import {
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
const WalletWidget = () => {
  const { address, isConnected } = useAccount();
  const { contracts } = useContractAddresses();
  const {
    balance: catBalance,
    isLoading: isCatBalanceLoading,
    refetch: refetchCatBalance,
  } = useCatTokenBalance();
  const { data: sonicBalance, isLoading: isSonicBalanceLoading } = useBalance({
    address: address,
    query: {
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
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts,
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

  if (!isConnected || !address) {
    return (
      <div className="bg-muted rounded-lg p-3 border border-border">
        <p className="text-xs text-muted-foreground">
          Connect your wallet to view balances
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted rounded-lg p-3 border border-border">
      {isLoading ? (
          <div className="flex items-center justify-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-2.5">
            {/* CAT Balance */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">CAT</p>
                <p className="text-xs font-semibold text-foreground">
                  ${catUsdValue}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {formattedCatBalance} CAT
              </p>
            </div>

            {/* Sonic Balance */}
            <div className="space-y-0.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">SONIC</p>
                <p className="text-xs font-semibold text-foreground">
                  ${sonicUsdValue}
                </p>
              </div>
              <p className="text-sm font-bold text-foreground">
                {formattedSonicBalance} SONIC
              </p>
            </div>

            {/* Claimable Rewards */}
            <div className="space-y-1.5 border-t border-border pt-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs text-muted-foreground">
                  Claimable rewards
                </p>
                <p className="text-sm font-bold text-foreground">
                  {isClaimableLoading ? "…" : `${formattedClaimable} CAT`}
                </p>
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
                className="flex w-full items-center justify-center gap-1.5 rounded-md bg-primary px-2 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Claim Rewards
              </SuccessButton>
            </div>
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
      className="flex items-center gap-2 py-2 hover:bg-accent rounded px-1 transition-colors duration-150"
    >
      <Avatar className="w-8 h-8 flex-shrink-0">
        <AvatarImage src={avatarUrl || undefined} alt={displayName} />
        <AvatarFallback className="bg-muted text-muted-foreground text-xs">
          {displayName
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground font-medium truncate">
          {displayName}
        </p>
        <p className="text-xs text-muted-foreground truncate">{username}</p>
      </div>
    </Link>
  );
};

interface ProfileLeftSidebarProps {
  userUuid: string;
}

// Stats Item Component
const StatItem = ({
  icon: Icon,
  label,
  value,
  highlighted = false,
  small = false,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  highlighted?: boolean;
  small?: boolean;
}) => (
  <div
    className={`flex items-center justify-between w-full ${
      highlighted ? "py-3 -mx-6 px-6" : small ? "py-1.5" : "py-2"
    }`}
  >
    <div className="flex items-center gap-2">
      <Icon
        className={`${
          highlighted
            ? "w-5 h-5 text-foreground"
            : small
            ? "w-3.5 h-3.5 text-muted-foreground"
            : "w-4 h-4 text-muted-foreground"
        }`}
      />
      <p
        className={`${
          highlighted
            ? "text-base font-medium text-foreground"
            : small
            ? "text-xs text-muted-foreground"
            : "text-sm text-muted-foreground"
        }`}
      >
        {label}:
      </p>
    </div>
    <p
      className={`${
        highlighted
          ? "text-base font-semibold text-foreground"
          : small
          ? "text-xs font-semibold text-foreground"
          : "text-sm font-semibold text-foreground"
      }`}
    >
      {value}
    </p>
  </div>
);

export const ProfileLeftSidebar = ({ userUuid }: ProfileLeftSidebarProps) => {
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
  const totalClaps = 42; // Static value as requested

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
          <WalletWidget />

          <div className="mt-4 space-y-1">
            <StatItem
              icon={FileText}
              label="Total posts"
              value={totalPosts}
              small={true}
            />
            <StatItem
              icon={Trophy}
              label="Total scores"
              value={totalScores}
              small={true}
            />
            <StatItem
              icon={CommentIcon}
              label="Comments"
              value={totalComments}
              small={true}
            />
            <StatItem icon={FlagIcon} label="Flags" value={totalFlags} small={true} />
            <StatItem icon={ClapIcon} label="Claps" value={totalClaps} small={true} />
          </div>
        </div>

        {/* Followers/Following */}
        <div className="border-t border-border pt-6">
          {/* Tabs */}
          <div className="flex gap-1 mb-4 border-b border-border">
            <button
              onClick={() => setActiveTab("followers")}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors duration-150 relative ${
                activeTab === "followers"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Followers
              {activeTab === "followers" && (
                <motion.div
                  layoutId="profile-sidebar-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("following")}
              className={`flex-1 py-2 px-3 text-sm font-medium transition-colors duration-150 relative ${
                activeTab === "following"
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Following
              {activeTab === "following" && (
                <motion.div
                  layoutId="profile-sidebar-tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                  transition={{ type: "spring", stiffness: 500, damping: 35 }}
                />
              )}
            </button>
          </div>

          {/* Count Display */}
          <div className="mb-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>
                {activeTab === "followers"
                  ? `${followersCount} ${
                      followersCount === 1 ? "follower" : "followers"
                    }`
                  : `${followingCount} ${
                      followingCount === 1 ? "following" : "following"
                    }`}
              </span>
            </div>
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {activeTab === "followers" ? (
              isFollowersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
                </div>
              ) : followers.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm text-muted-foreground">No followers yet</p>
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
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">Not following anyone yet</p>
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
