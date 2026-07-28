"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, User } from "lucide-react";
import { motion } from "framer-motion";
import { IoChevronUpCircle } from "react-icons/io5";
import { RightSidebarProps } from "@/types/home-revamp";
import { useAccount, useBlock } from "wagmi";
import {
  useReadCurateAiVoteVotesUsedToday,
  useReadCurateAiVoteLastVoteResetTime,
} from "@/hooks/wagmi/contracts";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { useContractAddresses } from "@/context/contractAddresses.provider";
import {
  RPC_POLL_INTERVAL_MS,
  RPC_BLOCK_POLL_INTERVAL_MS,
} from "@/constants/chain";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/api/profile";
import { getIpfsUrl } from "@/utils/ipfs";

const getUserIdFromToken = (): string | null => {
  try {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("accessToken")
        : null;
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.uuid || payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
};

// Mirrors vote.sol's VOTES_PER_DAY_MULTIPLIER: the daily allowance is
// 5 * token balance, enforced on-chain per rolling 24h window.
const VOTES_PER_DAY_MULTIPLIER = 5;

// Voting Power Widget — daily upvote allowance, in the same flat/editorial
// style as the "Total Balance" stat it replaced (big serif number, thin
// border accent), not a dashboard-style gauge.
//
// Reads the vote contract's own accounting (votesUsedToday /
// lastVoteResetTime) rather than the backend's score bookkeeping, so what's
// shown matches what the chain will actually enforce.
const VotingPowerWidget = () => {
  const { address } = useAccount();
  const { contracts } = useContractAddresses();
  const { balance: catBalance, isLoading: isBalanceLoading } =
    useCatTokenBalance();

  const { data: votesUsedRaw, isLoading: isUsedLoading } =
    useReadCurateAiVoteVotesUsedToday({
      address: contracts?.vote as `0x${string}`,
      args: address ? [address] : undefined,
      query: {
        enabled: !!address && !!contracts,
        refetchInterval: RPC_POLL_INTERVAL_MS,
        staleTime: RPC_POLL_INTERVAL_MS,
      },
    });
  const { data: lastResetTime } = useReadCurateAiVoteLastVoteResetTime({
    address: contracts?.vote as `0x${string}`,
    args: address ? [address] : undefined,
    query: {
      enabled: !!address && !!contracts,
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
  });
  // Chain time can drift from wall-clock time (e.g. a local node after
  // evm_increaseTime, or a stale latest block), so take the later of the two.
  const { data: latestBlock } = useBlock({
    query: {
      refetchInterval: RPC_BLOCK_POLL_INTERVAL_MS,
      staleTime: RPC_BLOCK_POLL_INTERVAL_MS,
    },
  });

  if (!address) {
    return (
      <div>
        <h3 className="font-serif text-base font-semibold mb-4 text-foreground">
          Voting Power
        </h3>
        <div className="border-l-2 border-border pl-4">
          <p className="text-[13px] text-muted-foreground">
            Sign in to see your daily voting power.
          </p>
        </div>
      </div>
    );
  }

  const nowSeconds = Math.max(
    Math.floor(Date.now() / 1000),
    Number(latestBlock?.timestamp ?? 0)
  );
  // The contract only zeroes votesUsedToday lazily on the next vote, so an
  // expired window means the on-chain counter is stale and effectively 0.
  const windowExpired =
    lastResetTime !== undefined &&
    nowSeconds >= Number(lastResetTime) + 86_400;
  const used =
    votesUsedRaw !== undefined && !windowExpired ? Number(votesUsedRaw) : 0;
  const maxVotes =
    catBalance !== undefined
      ? Number(catBalance) * VOTES_PER_DAY_MULTIPLIER
      : 0;
  const percentage =
    maxVotes > 0 ? Math.min(100, Math.round((used / maxVotes) * 100)) : 0;
  const remaining = Math.max(0, maxVotes - used);
  const isLoading = isBalanceLoading || isUsedLoading;

  return (
    <div>
      <h3 className="font-serif text-base font-semibold mb-4 text-foreground">
        Voting Power
      </h3>
      <div className="border-l-2 border-border pl-4">
        {isLoading ? (
          <div className="flex items-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <p className="text-[13px] text-muted-foreground mb-1">
              Used today
            </p>
            <p className="text-[32px] font-semibold text-foreground mb-2">
              {percentage}%
            </p>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden mb-3">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.6, ease: "easeOut" }}
              />
            </div>

            {used === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                Upvote a post to fill your daily power.
              </p>
            ) : (
              <>
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-foreground flex items-center gap-1.5">
                    <IoChevronUpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    Votes used
                  </span>
                  <span className="text-muted-foreground">
                    {used.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-foreground">Remaining</span>
                  <span className="text-muted-foreground">
                    {remaining.toLocaleString()} / {maxVotes.toLocaleString()}
                  </span>
                </div>
              </>
            )}
          </motion.div>
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

  const { isAuthenticated } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getUserIdFromToken());
  }, []);

  const { data: profile } = useUserProfile(userId || "", {
    enabled: isAuthenticated && Boolean(userId),
  });

  const profilePicUrl = profile?.profile?.profilePic
    ? getIpfsUrl(profile.profile.profilePic)
    : null;
  const displayName =
    profile?.profile?.fullName ||
    profile?.profile?.username ||
    profile?.email?.split("@")[0] ||
    "Your profile";
  const headline = profile?.profile?.username
    ? `@${profile.profile.username}`
    : "Curator on Curate AI";

  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-[100px] w-[225px] shrink-0"
    >
      <div className="overflow-hidden rounded-xl border border-border bg-background shadow-sm">
        <div className="h-14 bg-gradient-to-r from-primary/20 to-accent" />
        <div className="px-4 pb-4">
          <Link
            href={userId ? `/profile/${userId}` : "/auth"}
            className="-mt-7 mb-2 block w-fit"
          >
            {profilePicUrl ? (
              <img
                src={profilePicUrl}
                alt={displayName}
                className="h-14 w-14 rounded-full border-4 border-background object-cover"
              />
            ) : (
              <span className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-background bg-muted">
                <User className="h-6 w-6 text-muted-foreground" />
              </span>
            )}
          </Link>
          <h2 className="truncate font-serif text-[15px] font-semibold text-foreground">
            {isAuthenticated ? displayName : "Welcome"}
          </h2>
          <p className="truncate text-[13px] text-muted-foreground">
            {isAuthenticated ? headline : "Sign in to see your profile"}
          </p>
        </div>
        <div className="border-t border-border p-4">
          <VotingPowerWidget />
        </div>
      </div>
    </motion.div>
  );
};
