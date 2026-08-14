"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  usePeopleToFollow,
  useFollowUser,
  useUnfollowUser,
  useFollowStatus,
  type PeopleToFollowDto,
} from "@/hooks/api/follows";
import { useNextVote } from "@/hooks/api/schedule";
import { useAuth } from "@/hooks/useAuth";
import { display } from "@/components/brutal";

const pad = (n: number) => String(n).padStart(2, "0");

// Renders seconds as H:M:S, prefixed with days when the window is long (the
// cron is */5 during testing but becomes 24h in production).
const formatCountdown = (secs: number | null) => {
  if (secs === null) return "--:--:--";
  const d = Math.floor(secs / 86400);
  const h = Math.floor((secs % 86400) / 3600);
  const m = Math.floor((secs % 3600) / 60);
  const s = secs % 60;
  const hms = `${pad(h)}:${pad(m)}:${pad(s)}`;
  return d > 0 ? `${d}d ${hms}` : hms;
};

// A single odometer digit that rolls to its value — same digit-roll idea as the
// problem section's numbered rows. Non-digits render static.
const RollDigit = ({ d, reduced }: { d: number; reduced: boolean }) => {
  if (reduced) return <span>{d}</span>;
  return (
    <span className="relative inline-block overflow-hidden align-baseline" style={{ height: "1em" }}>
      <motion.span
        className="block"
        animate={{ y: `-${d}em` }}
        transition={{ type: "spring", stiffness: 320, damping: 30 }}
      >
        {Array.from({ length: 10 }).map((_, n) => (
          <span key={n} className="block leading-none" style={{ height: "1em" }}>
            {n}
          </span>
        ))}
      </motion.span>
    </span>
  );
};

const RollingCountdown = ({ text }: { text: string }) => {
  const reduced = !!useReducedMotion();
  return (
    <span className="inline-flex leading-none tabular-nums">
      {text.split("").map((ch, i) =>
        /\d/.test(ch) ? (
          <RollDigit key={i} d={Number(ch)} reduced={reduced} />
        ) : (
          <span key={i} className="inline-block leading-none">
            {ch === " " ? " " : ch}
          </span>
        )
      )}
    </span>
  );
};

const StatRow = ({
  label,
  value,
  delta,
  up,
}: {
  label: string;
  value: string;
  delta?: string;
  up?: boolean;
}) => (
  <div className="flex items-center justify-between border-b border-[color:var(--border)] py-2.5">
    <span className="text-[10px] uppercase tracking-[0.16em] text-[#0A0A0A]/55">
      {label}
    </span>
    <span className="flex items-baseline gap-2">
      <span className={`${display} text-[13px] font-bold tabular-nums text-[#0A0A0A]`}>
        {value}
      </span>
      {delta && (
        <span className="text-[11px] font-bold tabular-nums text-[#0A0A0A]/70">
          {up ? "▲" : "▼"} {delta}
        </span>
      )}
    </span>
  </div>
);

// On-chain / platform stats panel. Values are placeholders for now (except the
// live-ticking countdown) until wired to the contracts.
const ChainStats = () => {
  const { data, refetch } = useNextVote();
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  // Drive the countdown off the server-provided next-run time. We recompute
  // from the clock each tick (instead of decrementing) so it self-corrects
  // after the tab is backgrounded, and correct for client/server clock skew so
  // a long (e.g. 24h) countdown stays accurate.
  //
  // Until the backend `/schedule/next-vote` endpoint exists, fall back to the
  // next */5 wall-clock boundary computed locally so the timer still ticks.
  useEffect(() => {
    const FALLBACK_PERIOD_MS = 5 * 60 * 1000;
    const skew = data ? Date.parse(data.serverNow) - Date.now() : 0;
    const target = data ? Date.parse(data.nextRunAt) : null;
    let refetched = false;

    const tick = () => {
      let left: number;
      if (target !== null) {
        left = Math.round((target - (Date.now() + skew)) / 1000);
        if (left <= 0 && !refetched) {
          refetched = true;
          setTimeout(() => refetch(), 3000);
        }
      } else {
        const now = Date.now();
        const next = Math.ceil(now / FALLBACK_PERIOD_MS) * FALLBACK_PERIOD_MS;
        left = Math.round((next - now) / 1000);
      }
      setSecondsLeft(Math.max(0, left));
    };

    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [data, refetch]);

  const countdown = formatCountdown(secondsLeft);

  return (
    <section>
      <div className="flex items-center gap-2.5">
        <p className={`${display} text-[10px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A]/60`}>
          Chain Stats
        </p>
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-[#0A0A0A] opacity-40" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#0A0A0A]" />
        </span>
      </div>

      {/* Headline: the live countdown to the next AI vote */}
      <div className="mt-5">
        <p className="text-[10px] uppercase tracking-[0.2em] text-[#0A0A0A]/45">
          AI vote starts in
        </p>
        <p className={`${display} mt-2 text-[34px] font-black leading-none tracking-[-0.02em] text-[#0A0A0A]`}>
          <RollingCountdown text={countdown} />
        </p>
      </div>

      <div className="mt-6 border-t border-[color:var(--border)]">
        <StatRow label="Total votes today" value="12,480" />
        <StatRow label="Posts scored today" value="87" />
        <StatRow label="CAT Price" value="$0.0428" delta="2.4%" up />
        <StatRow label="Active curators" value="1,204" />
        <StatRow label="CAT staked" value="2.4M" />
      </div>
    </section>
  );
};

const PersonToFollowItem = ({ user }: { user: PeopleToFollowDto }) => {
  const { isAuthenticated } = useAuth();
  const { data: followStatus } = useFollowStatus(user.uuid, {
    enabled: isAuthenticated,
  });
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();
  const [isLocalLoading, setIsLocalLoading] = useState(false);

  const isFollowing = followStatus?.isFollowing ?? false;
  const isLoading = isLocalLoading;

  const profilePicUrl = user.profile?.profilePic
    ? `https://gateway.pinata.cloud/ipfs/${user.profile.profilePic}`
    : null;

  const nameHash = (user.profile?.username || user.email)
    .split("")
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const imgIndex = (nameHash % 70) + 1;
  const fallbackAvatarUrl = `https://i.pravatar.cc/150?img=${imgIndex}`;

  const displayName = user.profile?.fullName || user.email.split("@")[0];
  const username = user.profile?.username
    ? `@${user.profile.username}`
    : `@${user.email.split("@")[0]}`;

  const handleFollowClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated || isLoading) return;

    setIsLocalLoading(true);
    if (isFollowing) {
      unfollowMutation.mutate(
        { followingUuid: user.uuid },
        { onSettled: () => setIsLocalLoading(false) }
      );
    } else {
      followMutation.mutate(
        { followingUuid: user.uuid },
        { onSettled: () => setIsLocalLoading(false) }
      );
    }
  };

  return (
    <div className="flex items-center gap-3 border-b border-[color:var(--border)] py-3.5">
      <Link
        href={`/profile/${user.uuid}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <img
          src={profilePicUrl || fallbackAvatarUrl}
          alt={displayName}
          className="h-9 w-9 shrink-0 rounded-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== fallbackAvatarUrl) {
              e.currentTarget.src = fallbackAvatarUrl;
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <p className={`${display} truncate text-[13px] font-bold leading-snug text-[#0A0A0A]`}>
            {displayName}
          </p>
          <p className="line-clamp-1 text-[11px] uppercase tracking-[0.1em] text-[#0A0A0A]/45">
            {username}
          </p>
        </div>
      </Link>
      {isAuthenticated && (
        <button
          type="button"
          className={`shrink-0 whitespace-nowrap border border-[#0A0A0A] px-4 py-[7px] text-[10px] font-bold uppercase tracking-[0.14em] transition-colors duration-150 ${
            isFollowing
              ? "bg-[#0A0A0A] text-[#F5F4F0]"
              : "bg-transparent text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F5F4F0]"
          }`}
          onClick={handleFollowClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-3 w-3 animate-spin" />
          ) : isFollowing ? (
            "Following"
          ) : (
            "Follow"
          )}
        </button>
      )}
    </div>
  );
};

export const RightSidebar = ({
  onTopicClick,
}: {
  onTopicClick?: (topic: string) => void;
}) => {
  void onTopicClick; // topics live in the left sidebar now (merged)
  const { isAuthenticated } = useAuth();

  const {
    data: peopleToFollow,
    isLoading: isPeopleLoading,
    error: peopleError,
  } = usePeopleToFollow({ enabled: isAuthenticated });

  return (
    <div className="space-y-10">
      <ChainStats />

      {/* Who to follow */}
      <section>
        <p className={`${display} text-[10px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A]/60`}>
          Who to follow
        </p>
        <div className="mt-4">
          {!isAuthenticated ? (
            <p className="py-2 text-[12px] text-[#0A0A0A]/55">
              Sign in to discover people to follow.
            </p>
          ) : isPeopleLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-4 w-4 animate-spin text-[#0A0A0A]/50" />
            </div>
          ) : peopleError ? (
            <p className="py-2 text-[12px] text-[#0A0A0A]/55">
              Failed to load people to follow.
            </p>
          ) : !peopleToFollow || peopleToFollow.length === 0 ? (
            <p className="py-2 text-[12px] text-[#0A0A0A]/55">
              No people to follow right now.
            </p>
          ) : (
            <div className="border-t border-[color:var(--border)]">
              {peopleToFollow.map((user) => (
                <PersonToFollowItem key={user.uuid} user={user} />
              ))}
            </div>
          )}
        </div>
        <span className="mt-4 inline-block cursor-pointer text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A] underline decoration-[#0A0A0A]/40 underline-offset-4 transition-colors duration-150 hover:decoration-[#0A0A0A]">
          See more suggestions
        </span>
      </section>

      {/* Footer links */}
      <div className="flex flex-wrap gap-x-4 gap-y-2 border-t border-[color:var(--border)] pt-6">
        {[
          "Help",
          "Status",
          "About",
          "Careers",
          "Press",
          "Blog",
          "Privacy",
          "Terms",
        ].map((item) => (
          <span
            key={item}
            className="cursor-pointer text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/45 underline-offset-4 transition-colors duration-150 hover:text-[#0A0A0A] hover:underline"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
