"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { DUMMY_DISCUSSIONS } from "@/constants/home-revamp";
import {
  usePeopleToFollow,
  useFollowUser,
  useUnfollowUser,
  useFollowStatus,
  type PeopleToFollowDto,
} from "@/hooks/api/follows";
import { useAuth } from "@/hooks/useAuth";
import { useUserProfile } from "@/hooks/api/profile";
import { getIpfsUrl } from "@/utils/ipfs";

const linkGreen = "text-[14px] text-primary hover:underline";

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

const StaffPickAuthorRow = ({
  profilePicUrl,
  displayName,
}: {
  profilePicUrl: string | null;
  displayName: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const showImg = Boolean(profilePicUrl && !imgError);

  return (
    <div className="mb-2 flex items-center gap-2">
      {showImg ? (
        <img
          src={profilePicUrl!}
          alt=""
          className="h-5 w-5 shrink-0 rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className="h-5 w-5 shrink-0 rounded-full bg-muted"
          aria-hidden
        />
      )}
      <span className="text-[13px] font-medium text-foreground">
        {displayName}
      </span>
    </div>
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
    ? getIpfsUrl(user.profile.profilePic)
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
        {
          onSettled: () => {
            setIsLocalLoading(false);
          },
        }
      );
    } else {
      followMutation.mutate(
        { followingUuid: user.uuid },
        {
          onSettled: () => {
            setIsLocalLoading(false);
          },
        }
      );
    }
  };

  return (
    <div className="mb-4 flex cursor-pointer items-center gap-3">
      <Link
        href={`/profile/${user.uuid}`}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <img
          src={profilePicUrl || fallbackAvatarUrl}
          alt={displayName}
          className="h-10 w-10 shrink-0 rounded-full object-cover"
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
          <p className="line-clamp-2 text-[13px] leading-snug text-muted-foreground">
            {username}
          </p>
        </div>
      </Link>
      {isAuthenticated && (
        <motion.button
          type="button"
          whileTap={{ scale: 0.93 }}
          className={`shrink-0 whitespace-nowrap rounded-full border px-4 py-[7px] text-[14px] transition-colors duration-150 ${
            isFollowing
              ? "border-primary bg-primary text-primary-foreground"
              : "border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
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
        </motion.button>
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
  const [viewerUuid, setViewerUuid] = useState<string | null>(null);

  useEffect(() => {
    setViewerUuid(getUserIdFromToken());
  }, []);

  const { data: viewerProfile } = useUserProfile(viewerUuid || "", {
    enabled: isAuthenticated && Boolean(viewerUuid),
  });

  const staffPickAuthorPicUrl = viewerProfile?.profile?.profilePic
    ? getIpfsUrl(viewerProfile.profile.profilePic)
    : null;
  const staffPickAuthorName =
    (isAuthenticated &&
      (viewerProfile?.profile?.fullName ||
        viewerProfile?.profile?.username ||
        viewerProfile?.email?.split("@")[0])) ||
    "Author Name";

  const {
    data: peopleToFollow,
    isLoading: isPeopleLoading,
    error: peopleError,
  } = usePeopleToFollow({ enabled: isAuthenticated });

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4 }}
      className="sticky top-[100px] space-y-3"
    >
      <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
        <h3 className="font-serif mb-4 text-base font-semibold text-foreground">
          Staff Picks
        </h3>
        <div className="space-y-5">
          {DUMMY_DISCUSSIONS.slice(0, 2).map((discussion, idx) => (
            <div key={discussion.title + idx} className="group cursor-pointer">
              <StaffPickAuthorRow
                profilePicUrl={isAuthenticated ? staffPickAuthorPicUrl : null}
                displayName={staffPickAuthorName}
              />
              <p className="font-serif text-[15px] font-semibold leading-[1.4] text-foreground group-hover:underline">
                {discussion.title}
              </p>
            </div>
          ))}
        </div>
        <span className={`mt-3 inline-block cursor-pointer ${linkGreen}`}>
          See the full list →
        </span>
      </div>

      <div className="rounded-xl border border-border bg-background p-4 shadow-sm">
        <h3 className="font-serif mb-4 text-base font-semibold text-foreground">
          Who to follow
        </h3>
        {!isAuthenticated ? (
          <div className="py-4 text-xs text-muted-foreground">
            Sign in to discover people to follow
          </div>
        ) : isPeopleLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          </div>
        ) : peopleError ? (
          <div className="py-4 text-xs text-muted-foreground">
            Failed to load people to follow
          </div>
        ) : !peopleToFollow || peopleToFollow.length === 0 ? (
          <div className="py-4 text-xs text-muted-foreground">
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
      </div>

      <div className="flex flex-wrap gap-x-4 gap-y-2.5 px-1">
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
    </motion.div>
  );
};
