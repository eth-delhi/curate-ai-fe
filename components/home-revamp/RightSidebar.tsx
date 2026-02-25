"use client";

import { useState } from "react";
import { MessageSquare, Loader2 } from "lucide-react";
import Link from "next/link";
import { DUMMY_DISCUSSIONS } from "@/constants/home-revamp";
import {
  usePeopleToFollow,
  useFollowUser,
  useUnfollowUser,
  useFollowStatus,
  type PeopleToFollowDto,
} from "@/hooks/api/follows";
import { useAuth } from "@/hooks/useAuth";
import { getIpfsUrl } from "@/utils/ipfs";

const DiscussionItem = ({
  discussion,
}: {
  discussion: {
    title: string;
    comments: number;
    isNew?: boolean;
  };
}) => (
  <Link
    href="#"
    className="block py-2 hover:bg-gray-50 rounded px-1 transition-colors"
  >
    <div className="flex items-start justify-between gap-2">
      <p className="text-sm text-gray-900 flex-1 leading-snug">
        {discussion.title}
      </p>
      {discussion.isNew && (
        <span className="text-xs font-medium bg-yellow-100 text-yellow-700 px-1 py-0.5 rounded flex-shrink-0">
          New
        </span>
      )}
    </div>
    {discussion.comments > 0 && (
      <p className="text-xs text-gray-400 mt-1">
        {discussion.comments} comments
      </p>
    )}
  </Link>
);

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

  // Get profile picture URL
  const profilePicUrl = user.profile?.profilePic
    ? getIpfsUrl(user.profile.profilePic)
    : null;

  // Generate fallback avatar based on username or email
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
    <div className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-1 transition-colors">
      <Link
        href={`/profile-revamp/${user.uuid}`}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        <img
          src={profilePicUrl || fallbackAvatarUrl}
          alt={displayName}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
          onError={(e) => {
            // Fallback to pravatar if IPFS image fails to load
            if (e.currentTarget.src !== fallbackAvatarUrl) {
              e.currentTarget.src = fallbackAvatarUrl;
            }
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 leading-snug truncate">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 leading-snug truncate">
            {username}
          </p>
        </div>
      </Link>
      {isAuthenticated && (
        <button
          className={`text-xs px-2 py-1 rounded transition-colors flex-shrink-0 border-none ${
            isFollowing
              ? "text-gray-600 hover:text-gray-800 hover:bg-gray-100 bg-gray-50"
              : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 bg-transparent"
          }`}
          onClick={handleFollowClick}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
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

export const RightSidebar = () => {
  const { isAuthenticated } = useAuth();
  const {
    data: peopleToFollow,
    isLoading: isPeopleLoading,
    error: peopleError,
  } = usePeopleToFollow({ enabled: isAuthenticated });

  return (
    <div className="w-80 bg-white border-l border-gray-100 p-6 overflow-y-auto">
      {/* #discuss Section */}
      <div className="mb-8">
        <h3 className="text-sm font-bold text-gray-900 mb-2">#discuss</h3>
        <p className="text-xs text-gray-500 mb-4">
          Discussion threads targeting the whole community
        </p>
        <div className="space-y-1">
          {DUMMY_DISCUSSIONS.slice(0, 4).map((discussion, i) => (
            <DiscussionItem key={i} discussion={discussion} />
          ))}
        </div>
      </div>

      {/* People to Follow */}
      <div>
        <h3 className="text-sm font-bold text-gray-900 mb-2">
          #people to follow
        </h3>
        <p className="text-xs text-gray-500 mb-4">
          Discover creators and thought leaders
        </p>
        {!isAuthenticated ? (
          <div className="text-xs text-gray-500 py-4">
            Sign in to discover people to follow
          </div>
        ) : isPeopleLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
          </div>
        ) : peopleError ? (
          <div className="text-xs text-gray-500 py-4">
            Failed to load people to follow
          </div>
        ) : !peopleToFollow || peopleToFollow.length === 0 ? (
          <div className="text-xs text-gray-500 py-4">
            No people to follow at the moment
          </div>
        ) : (
          <div className="space-y-1">
            {peopleToFollow.map((user) => (
              <PersonToFollowItem key={user.uuid} user={user} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
