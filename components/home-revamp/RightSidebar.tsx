"use client";

import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RightSidebarProps } from "@/types/home-revamp";
import {
  DUMMY_USERS,
  DUMMY_TRENDS,
  DUMMY_TOPICS,
} from "@/constants/home-revamp";

const UserCard = ({
  user,
  onFollow,
}: {
  user: any;
  onFollow?: (userId: string) => void;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-2">
      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
      <span className="text-sm font-medium">{user.name}</span>
    </div>
    <Button
      variant={user.following ? "default" : "outline"}
      size="sm"
      className={
        user.following
          ? "bg-black hover:bg-gray-800 rounded-full text-white cursor-pointer"
          : "rounded-full cursor-pointer"
      }
      onClick={() => onFollow?.(user.name)}
    >
      {user.following ? "Following" : "Follow"}
    </Button>
  </div>
);

const TrendCard = ({ trend }: { trend: any }) => (
  <div>
    <h4 className="font-medium text-sm mb-1">{trend.title}</h4>
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-500">By</span>
      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
      <span className="text-xs text-gray-700">{trend.author}</span>
    </div>
  </div>
);

const TopicButton = ({
  topic,
  onClick,
}: {
  topic: string;
  onClick?: (topic: string) => void;
}) => (
  <button
    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium transition-colors cursor-pointer"
    onClick={() => onClick?.(topic)}
  >
    {topic}
  </button>
);

export const RightSidebar = ({
  users = DUMMY_USERS,
  trends = DUMMY_TRENDS,
  topics = DUMMY_TOPICS,
  onFollowUser,
  onTopicClick,
}: RightSidebarProps) => {
  return (
    <div className="w-80 bg-white border-l border-gray-100 p-6 overflow-y-auto">
      {/* People to Follow */}
      <div className="mb-10">
        <h3 className="font-semibold mb-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> People who to follow
        </h3>
        <div className="space-y-4">
          {users.map((user, i) => (
            <UserCard key={i} user={user} onFollow={onFollowUser} />
          ))}
        </div>
      </div>

      {/* Top Trends */}
      <div className="mb-10">
        <h3 className="font-semibold mb-5 flex items-center gap-2">
          <span className="rotate-45">◆</span> Today's top trends
        </h3>
        <div className="space-y-5">
          {trends.map((trend, i) => (
            <TrendCard key={i} trend={trend} />
          ))}
        </div>
      </div>

      {/* Topics */}
      <div>
        <h3 className="font-semibold mb-5 flex items-center gap-2">
          <Sparkles className="w-4 h-4" /> Topics for you
        </h3>
        <div className="flex flex-wrap gap-2">
          {topics.map((topic, i) => (
            <TopicButton key={i} topic={topic} onClick={onTopicClick} />
          ))}
        </div>
      </div>
    </div>
  );
};
