"use client";

import { MessageSquare } from "lucide-react";
import Link from "next/link";
import { DUMMY_DISCUSSIONS, DUMMY_USERS } from "@/constants/home-revamp";

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

const PersonToFollowItem = ({
  user,
  onFollow,
}: {
  user: any;
  onFollow?: (userId: string) => void;
}) => {
  // Generate consistent dummy profile picture based on user name
  const nameHash = user.name
    .split("")
    .reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
  const imgIndex = (nameHash % 70) + 1;
  const avatarUrl = `https://i.pravatar.cc/150?img=${imgIndex}`;

  // Generate username from name (lowercase, replace spaces with dots)
  const username =
    user.username || `@${user.name.toLowerCase().replace(/\s+/g, ".")}`;

  return (
    <div className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-1 transition-colors">
      <Link
        href={`/profile-revamp/${user.uuid || user.name}`}
        className="flex items-center gap-2 flex-1 min-w-0"
      >
        <img
          src={avatarUrl}
          alt={user.name}
          className="w-6 h-6 rounded-full object-cover flex-shrink-0"
        />
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-900 leading-snug">{user.name}</p>
          <p className="text-xs text-gray-500 leading-snug">{username}</p>
        </div>
      </Link>
      <button
        className="text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 px-2 py-1 rounded transition-colors flex-shrink-0 border-none bg-transparent"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onFollow?.(user.name);
        }}
      >
        Follow
      </button>
    </div>
  );
};

export const RightSidebar = () => {
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
        <div className="space-y-1">
          {DUMMY_USERS.map((user, i) => (
            <PersonToFollowItem
              key={i}
              user={user}
              onFollow={(name) => {
                console.log("Follow user:", name);
                // Handle follow logic here
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
