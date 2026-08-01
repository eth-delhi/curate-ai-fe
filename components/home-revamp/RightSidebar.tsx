"use client";

import { useEffect, useState } from "react";
import { Loader2, Plus } from "lucide-react";
import Link from "next/link";
import {
  usePeopleToFollow,
  useFollowUser,
  useUnfollowUser,
  useFollowStatus,
  type PeopleToFollowDto,
} from "@/hooks/api/follows";
import { useTopTags } from "@/hooks/api/tags";
import { useAuth } from "@/hooks/useAuth";

const linkGreen = "text-[13px] text-primary hover:underline";

const pad = (n: number) => String(n).padStart(2, "0");
// Random window (30m–6.5h) used as a placeholder until this is wired to the
// real on-chain AI vote schedule.
const randomCountdown = () => 1800 + Math.floor(Math.random() * 6 * 3600);

const StatRow = ({
  label,
  value,
  sub,
  positive,
}: {
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
}) => (
  <div className="flex items-center justify-between py-1.5">
    <span className="text-[13px] text-muted-foreground">{label}</span>
    <span className="flex items-baseline gap-1.5">
      <span className="text-[14px] font-semibold text-foreground tabular-nums">
        {value}
      </span>
      {sub && (
        <span
          className={`text-[12px] ${
            positive ? "text-emerald-600" : "text-muted-foreground"
          }`}
        >
          {sub}
        </span>
      )}
    </span>
  </div>
);

// On-chain / platform stats panel that replaces "Staff Picks". Values are
// placeholders for now (except the live-ticking countdown) until wired to
// the contracts.
const ChainStats = () => {
  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    setSecondsLeft(randomCountdown());
    const id = setInterval(() => {
      setSecondsLeft((s) =>
        s === null || s <= 1 ? randomCountdown() : s - 1
      );
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const total = secondsLeft ?? 0;
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const countdown =
    secondsLeft === null ? "--:--:--" : `${pad(h)}:${pad(m)}:${pad(s)}`;

  return (
    <section>
      <div className="mb-4 flex items-center gap-2">
        <h3 className="text-base font-bold text-foreground">Chain Stats</h3>
        <span className="relative flex h-2 w-2" aria-hidden>
          <span className="absolute inline-flex h-full w-full animate-pulse-dot rounded-full bg-emerald-500 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
        </span>
      </div>

      {/* Headline: the live countdown to the next AI vote */}
      <div className="mb-4 rounded-xl border border-border bg-muted/40 px-4 py-3">
        <p className="text-[12px] text-muted-foreground">AI vote starts in</p>
        <p className="mt-0.5 text-[26px] font-bold leading-none tracking-tight text-foreground tabular-nums">
          {countdown}
        </p>
      </div>

      <div className="divide-y divide-border">
        <StatRow label="Total votes today" value="12,480" />
        <StatRow label="Posts scored today" value="87" />
        <StatRow label="CAT Price" value="$0.0428" sub="+2.4%" positive />
        <StatRow label="Active curators" value="1,204" />
        <StatRow label="CAT staked" value="2.4M" />
      </div>
    </section>
  );
};

const FALLBACK_TOPICS = [
  "Self Improvement",
  "Writing",
  "Relationships",
  "Politics",
  "Productivity",
  "Money",
  "Python",
];

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
    <div className="mb-4 flex items-center gap-3">
      <Link
        href={`/profile/${user.uuid}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <img
          src={profilePicUrl || fallbackAvatarUrl}
          alt={displayName}
          className="h-8 w-8 shrink-0 rounded-full object-cover"
          onError={(e) => {
            if (e.currentTarget.src !== fallbackAvatarUrl) {
              e.currentTarget.src = fallbackAvatarUrl;
            }
          }}
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[14px] font-medium leading-snug text-foreground">
            {displayName}
          </p>
          <p className="line-clamp-1 text-[13px] leading-snug text-muted-foreground">
            {username}
          </p>
        </div>
      </Link>
      {isAuthenticated && (
        <button
          type="button"
          className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-[6px] text-[13px] transition-colors duration-150 ${
            isFollowing
              ? "border-foreground bg-foreground text-background"
              : "border-foreground bg-transparent text-foreground hover:bg-foreground hover:text-background"
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
  const { isAuthenticated } = useAuth();

  const { data: topTags } = useTopTags({ limit: 7 });
  const topics =
    topTags && topTags.length > 0
      ? topTags.map((t) => t.name)
      : FALLBACK_TOPICS;

  const {
    data: peopleToFollow,
    isLoading: isPeopleLoading,
    error: peopleError,
  } = usePeopleToFollow({ enabled: isAuthenticated });

  return (
    <div className="space-y-8">
      {/* On-chain / platform stats */}
      <ChainStats />

      {/* Recommended topics */}
      <section>
        <h3 className="mb-4 text-base font-bold text-foreground">
          Recommended topics
        </h3>
        <div className="flex flex-wrap gap-2.5">
          {topics.map((topic) => (
            <button
              key={topic}
              type="button"
              onClick={() => onTopicClick?.(topic)}
              className="flex items-center gap-1.5 rounded-full bg-muted px-4 py-2 text-[13px] text-foreground transition-colors duration-150 hover:bg-border"
            >
              <span className="max-w-[160px] truncate">{topic}</span>
              <Plus className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
            </button>
          ))}
        </div>
        <span className={`mt-4 inline-block cursor-pointer ${linkGreen}`}>
          See more topics
        </span>
      </section>

      {/* Who to follow */}
      <section>
        <h3 className="mb-4 text-base font-bold text-foreground">
          Who to follow
        </h3>
        {!isAuthenticated ? (
          <div className="py-2 text-[13px] text-muted-foreground">
            Sign in to discover people to follow
          </div>
        ) : isPeopleLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : peopleError ? (
          <div className="py-2 text-[13px] text-muted-foreground">
            Failed to load people to follow
          </div>
        ) : !peopleToFollow || peopleToFollow.length === 0 ? (
          <div className="py-2 text-[13px] text-muted-foreground">
            No people to follow at the moment
          </div>
        ) : (
          <div>
            {peopleToFollow.map((user) => (
              <PersonToFollowItem key={user.uuid} user={user} />
            ))}
          </div>
        )}
        <span className={`mt-1 inline-block cursor-pointer ${linkGreen}`}>
          See more suggestions
        </span>
      </section>

      {/* Footer links */}
      <div className="flex flex-wrap gap-x-4 gap-y-2.5">
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
            className="cursor-pointer text-[13px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};
