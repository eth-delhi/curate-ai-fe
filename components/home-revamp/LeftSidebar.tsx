"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, Settings, ChevronDown, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { UpvoteIcon } from "@/components/icons";
import { RightSidebarProps } from "@/types/home-revamp";
import { useAccount, useBlock } from "wagmi";
import {
  useReadCurateAiVoteVotesUsedToday,
  useReadCurateAiVoteLastVoteResetTime,
  useReadCurateAiVoteVotesPerDayMultiplier,
} from "@/hooks/wagmi/contracts";
import { useCatVotePower } from "@/hooks/wagmi/useCatVotePower";
import { useContractAddresses } from "@/context/contractAddresses.provider";
import {
  RPC_POLL_INTERVAL_MS,
  RPC_BLOCK_POLL_INTERVAL_MS,
} from "@/constants/chain";
import { useAuth } from "@/hooks/useAuth";
import { useFollowing } from "@/hooks/api/follows";
import { useTopTags } from "@/hooks/api/tags";
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

// Small compass-style glyph shown next to each followed topic.
const TopicIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    className={className}
  >
    <circle cx="12" cy="12" r="8.5" />
    <path
      d="M14.6 9.4 13 13l-3.6 1.6L11 11l3.6-1.6Z"
      fill="currentColor"
      stroke="none"
    />
  </svg>
);

const FALLBACK_TOPICS = [
  "Web Development",
  "React",
  "Blockchain",
  "Software Engineering",
  "Artificial Intelligence",
];

// Daily upvote allowance, shown flat (no card) to sit in the editorial
// sidebar: a big number + a thin black meter + used/remaining stats.
//
// Reads the vote contract's own accounting (votesUsedToday /
// lastVoteResetTime) rather than the backend's score bookkeeping, so what's
// shown matches what the chain will actually enforce.
const VotingPowerWidget = () => {
  const { address } = useAccount();
  const { contracts } = useContractAddresses();
  // Daily budget is multiplier × votePowerOf (start-of-day balance), which is
  // what vote.sol enforces — not the live wallet balance.
  const { votePower, isLoading: isVotePowerLoading } = useCatVotePower();

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
  const { data: votesPerDayMultiplier } =
    useReadCurateAiVoteVotesPerDayMultiplier({
      address: contracts?.vote as `0x${string}`,
      query: { enabled: !!contracts && !!address, staleTime: Infinity },
    });
  // Chain time can drift from wall-clock time, so take the later of the two.
  // Gated on address: this widget is hidden for logged-out visitors (see the
  // early return below), so there's no reason to poll a block for them.
  const { data: latestBlock } = useBlock({
    query: {
      enabled: !!address,
      refetchInterval: RPC_BLOCK_POLL_INTERVAL_MS,
      staleTime: RPC_BLOCK_POLL_INTERVAL_MS,
    },
  });

  if (!address) {
    return (
      <div>
        <h3 className="mb-2 text-[15px] font-bold text-foreground">
          Voting Power
        </h3>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          Sign in to see how much of your daily voting power you&apos;ve used.
        </p>
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
    votePower !== undefined && votesPerDayMultiplier !== undefined
      ? Number(votePower) * Number(votesPerDayMultiplier)
      : 0;
  const percentage =
    maxVotes > 0 ? Math.min(100, Math.round((used / maxVotes) * 100)) : 0;
  const remaining = Math.max(0, maxVotes - used);
  const isLoading =
    isVotePowerLoading || isUsedLoading || votesPerDayMultiplier === undefined;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-[15px] font-bold text-foreground">Voting Power</h3>
        <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          Today
        </span>
      </div>

      {isLoading ? (
        <div className="flex items-center py-3">
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mb-2 flex items-baseline gap-1.5">
            <span className="text-[36px] font-bold leading-none tracking-tight text-foreground">
              {percentage}%
            </span>
            <span className="text-[13px] text-muted-foreground">used</span>
          </div>
          <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <motion.div
              className="h-full rounded-full bg-foreground"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {used === 0 ? (
            <p className="text-[13px] leading-relaxed text-muted-foreground">
              Upvote a post to start spending your daily power.
            </p>
          ) : (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[13px]">
                <span className="flex items-center gap-1.5 text-foreground">
                  <UpvoteIcon className="h-3.5 w-3.5 text-muted-foreground" />
                  Votes used
                </span>
                <span className="font-semibold text-foreground">
                  {used.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-muted-foreground">Remaining</span>
                <span className="text-muted-foreground">
                  {remaining.toLocaleString()} / {maxVotes.toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
};

export const LeftSidebar = ({
  onTopicClick,
}: Pick<RightSidebarProps, "onTopicClick">) => {
  const { isAuthenticated } = useAuth();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    setUserId(getUserIdFromToken());
  }, []);
  void userId;

  const { data: topTags } = useTopTags({ limit: 5 });
  const { data: followingList } = useFollowing({ enabled: isAuthenticated });

  const topics =
    topTags && topTags.length > 0
      ? topTags.map((t) => t.name)
      : FALLBACK_TOPICS;
  const writers = (followingList ?? []).slice(0, 4);

  return (
    <div>
      <VotingPowerWidget />

      <div className="mt-6 border-t border-border pt-6">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-[15px] font-medium text-foreground">
            Following
          </span>
          <button
            type="button"
            aria-label="Manage following"
            className="rounded-full p-1 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
          >
            <Settings className="h-[18px] w-[18px]" strokeWidth={1.6} />
          </button>
        </div>

        <p className="mb-1 text-[13px] font-medium text-muted-foreground">
          Topics
        </p>
        <div className="flex flex-col">
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => onTopicClick?.(topic)}
              className="flex items-center gap-3 py-2 text-left text-[14px] text-foreground/80 transition-colors duration-150 hover:text-foreground"
            >
              <TopicIcon className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
              <span className="truncate">{topic}</span>
            </button>
          ))}
          <button
            type="button"
            className="flex items-center gap-3 py-2 text-left text-[14px] text-foreground/80 transition-colors duration-150 hover:text-foreground"
          >
            <ChevronDown className="h-[18px] w-[18px] shrink-0 text-muted-foreground" />
            <span>More</span>
          </button>
        </div>

        {isAuthenticated && writers.length > 0 && (
          <>
            <p className="mb-2 mt-5 text-[13px] font-medium text-muted-foreground">
              Writers and publications
            </p>
            <div className="flex flex-col gap-1">
              {writers.map((w, i) => {
                const pic = w.profile?.profilePic
                  ? getIpfsUrl(w.profile.profilePic)
                  : null;
                const label =
                  w.profile?.fullName ||
                  w.profile?.username ||
                  w.email.split("@")[0];
                return (
                  <Link
                    key={w.uuid}
                    href={`/profile/${w.uuid}`}
                    className="group flex items-center gap-2.5 py-1.5"
                  >
                    {pic ? (
                      <img
                        src={pic}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-foreground">
                        {(label || "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate text-[14px] text-foreground/80 group-hover:text-foreground">
                      {label}
                    </span>
                    {i === 0 && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <button
          type="button"
          className="mt-6 flex items-start gap-3 text-left text-[14px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <Plus className="mt-0.5 h-[18px] w-[18px] shrink-0" strokeWidth={1.6} />
          <span>Find topics, writers and publications to follow.</span>
        </button>

        <Link
          href="/home"
          className="mt-4 inline-block text-[13px] text-primary hover:underline"
        >
          See suggestions
        </Link>
      </div>
    </div>
  );
};
