"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
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
import { display } from "@/components/brutal";

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

const FALLBACK_TOPICS = [
  "Web Development",
  "React",
  "Blockchain",
  "Software Engineering",
  "Artificial Intelligence",
];

// Eyebrow label used across the ledger-style sidebar blocks.
const Eyebrow = ({ children }: { children: React.ReactNode }) => (
  <p className={`${display} text-[10px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A]/55`}>
    {children}
  </p>
);

// Daily upvote allowance, shown flat (no card) as a ledger block: eyebrow, a
// huge display-type percentage, a 2px ink meter, and used/remaining stats.
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
        <Eyebrow>Voting Power</Eyebrow>
        <p className="mt-3 text-[12px] leading-relaxed text-[#0A0A0A]/55">
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
      <Eyebrow>Voting Power</Eyebrow>

      {isLoading ? (
        <div className="flex items-center py-4">
          <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0A]/50" />
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`${display} text-[52px] font-black leading-[0.85] tracking-[-0.02em] text-[#0A0A0A]`}>
              {percentage}%
            </span>
            <span className="text-[10px] uppercase tracking-[0.16em] text-[#0A0A0A]/45">
              used today
            </span>
          </div>

          {/* Thin ink meter — a measurement line, not a rounded bar */}
          <div className="mt-4 h-[2px] w-full bg-[#0A0A0A]/12">
            <motion.div
              className="h-full bg-[#0A0A0A]"
              initial={{ width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>

          {used === 0 ? (
            <p className="mt-4 text-[12px] leading-relaxed text-[#0A0A0A]/55">
              Upvote a post to start spending your daily power.
            </p>
          ) : (
            <div className="mt-4 space-y-2 text-[11px] uppercase tracking-[0.1em]">
              <div className="flex items-center justify-between">
                <span className="text-[#0A0A0A]/55">Votes used</span>
                <span className="font-bold tabular-nums text-[#0A0A0A]">
                  {used.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#0A0A0A]/55">Remaining</span>
                <span className="tabular-nums text-[#0A0A0A]/70">
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

  const { data: topTags } = useTopTags({ limit: 6 });
  const { data: followingList } = useFollowing({ enabled: isAuthenticated });

  const topics =
    topTags && topTags.length > 0
      ? topTags.map((t) => t.name)
      : FALLBACK_TOPICS;
  const writers = (followingList ?? []).slice(0, 4);

  return (
    <div>
      <VotingPowerWidget />

      <div className="mt-10 border-t border-[color:var(--border)] pt-8">
        <Eyebrow>Following · Topics</Eyebrow>

        <div className="mt-4 flex flex-col">
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => onTopicClick?.(topic)}
              className="group flex items-center gap-3 py-2 text-left text-[13px] leading-relaxed text-[#0A0A0A]/75 transition-colors duration-150 hover:text-[#0A0A0A]"
            >
              <span className="text-[#0A0A0A]/40">·</span>
              <span className="truncate underline-offset-4 group-hover:underline">
                {topic}
              </span>
            </button>
          ))}
          <button
            type="button"
            className="group flex items-center gap-3 py-2 text-left text-[13px] text-[#0A0A0A]/50 transition-colors duration-150 hover:text-[#0A0A0A]"
          >
            <span className="text-[#0A0A0A]/40">·</span>
            <span className="underline-offset-4 group-hover:underline">
              More topics
            </span>
          </button>
        </div>

        {isAuthenticated && writers.length > 0 && (
          <>
            <p className="mb-3 mt-8 text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/45">
              Writers &amp; publications
            </p>
            <div className="flex flex-col">
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
                    className="group flex items-center gap-2.5 py-2"
                  >
                    {pic ? (
                      <img
                        src={pic}
                        alt=""
                        className="h-6 w-6 shrink-0 rounded-full object-cover"
                      />
                    ) : (
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0A0A0A]/10 text-[10px] font-bold text-[#0A0A0A]">
                        {(label || "?").slice(0, 1).toUpperCase()}
                      </span>
                    )}
                    <span className="truncate text-[13px] text-[#0A0A0A]/75 underline-offset-4 group-hover:text-[#0A0A0A] group-hover:underline">
                      {label}
                    </span>
                    {i === 0 && (
                      <span className="ml-auto h-1.5 w-1.5 shrink-0 rounded-full bg-[#0A0A0A]" />
                    )}
                  </Link>
                );
              })}
            </div>
          </>
        )}

        <Link
          href="/home"
          className="mt-6 inline-block text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A] underline decoration-[#0A0A0A]/40 underline-offset-4 transition-colors duration-150 hover:decoration-[#0A0A0A]"
        >
          See suggestions
        </Link>
      </div>
    </div>
  );
};
