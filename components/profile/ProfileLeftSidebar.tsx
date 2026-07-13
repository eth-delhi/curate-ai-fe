"use client";

import { useState } from "react";
import {
  Wallet,
  Loader2,
  Users,
  Trophy,
  MessageSquare,
  Flag,
  Hand,
  FileText,
} from "lucide-react";
import { useAccount, useBalance } from "wagmi";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { useReadCuratAiTokenDecimals } from "@/hooks/wagmi/contracts";
import { contract } from "@/constants/contract";
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
  const { balance: catBalance, isLoading: isCatBalanceLoading } =
    useCatTokenBalance();
  const { data: catDecimals } = useReadCuratAiTokenDecimals({
    address: contract.token as `0x${string}`,
  });
  const { data: sonicBalance, isLoading: isSonicBalanceLoading } = useBalance({
    address: address,
  });

  // Mock conversion rates
  const MOCK_CAT_USD_RATE = 0.15;
  const MOCK_SONIC_USD_RATE = 0.001;

  const isLoading = isCatBalanceLoading || isSonicBalanceLoading;

  const formattedCatBalance = useMemo(() => {
    if (!catBalance || !catDecimals) return "0.00";
    try {
      const formatted = formatUnits(catBalance, catDecimals);
      return parseFloat(formatted).toFixed(2);
    } catch {
      return "0.00";
    }
  }, [catBalance, catDecimals]);

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
        <div className="bg-muted rounded-lg p-3 border border-border">
          <p className="text-xs text-muted-foreground">
            Connect your wallet to view balances
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6">
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
          </div>
        )}
      </div>
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
    <div className="w-80 bg-background border-r border-border p-6 overflow-y-auto h-full flex flex-col">
      {/* Wallet Widget */}
      <WalletWidget />

      {/* Stats Section */}
      <div className="mb-6 pb-6 border-b border-border">
        <div className="space-y-1">
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
            icon={MessageSquare}
            label="Comments"
            value={totalComments}
            small={true}
          />
          <StatItem icon={Flag} label="Flags" value={totalFlags} small={true} />
          <StatItem icon={Hand} label="Claps" value={totalClaps} small={true} />
        </div>
      </div>

      {/* Followers/Following Section */}
      <div className="flex-1 flex flex-col">
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
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
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
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>
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
        <div className="flex-1 overflow-y-auto">
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
  );
};
