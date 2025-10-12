"use client";

import { Bookmark } from "lucide-react";
import { FeedSectionProps } from "@/types/home-revamp";
import { TAB_OPTIONS } from "@/constants/home-revamp";
import { truncateText } from "@/utils/home-revamp";

const FeedPostCard = ({ post }: { post: any }) => (
  <div className="bg-white rounded-2xl p-6 hover:shadow-lg transition-shadow">
    <div className="flex gap-6">
      {/* Thumbnail - always reserve space */}
      <div className="w-36 h-36 flex-shrink-0">
        {post.imageUrl ? (
          <img
            src={post.imageUrl}
            alt=""
            className="w-full h-full rounded-xl object-cover"
          />
        ) : (
          <div className="w-full h-full rounded-xl bg-gray-100"></div>
        )}
      </div>

      {/* Content - always starts from same position */}
      <div className="flex-1">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-xl">{post.title}</h3>
          <span className="text-xs text-gray-400">
            {post.timeAgo || "Recently"}
          </span>
        </div>
        <p className="text-sm text-gray-600 mb-4">
          {truncateText(post.content, 200)}
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full bg-gradient-to-br ${
                post.authorAvatar || "from-gray-400 to-gray-600"
              }`}
            />
            <span className="text-sm text-gray-700">
              {post.author || "Anonymous"}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-500">
              {post.readTime || "5 min read"}
            </span>
            <button className="text-sm text-gray-600 hover:text-black flex items-center gap-1">
              <Bookmark className="w-4 h-4" /> Save for Later
            </button>
            <button className="text-sm font-medium hover:text-black">
              Read more →
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TabButton = ({
  tab,
  isActive,
  onClick,
}: {
  tab: { id: string; label: string };
  isActive: boolean;
  onClick: (id: string) => void;
}) => (
  <button
    className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
      isActive ? "bg-black text-white" : "bg-white hover:bg-gray-50"
    }`}
    onClick={() => onClick(tab.id)}
  >
    {tab.label}
  </button>
);

export const FeedSection = ({
  posts,
  activeTab,
  onTabChange,
  isLoading,
}: FeedSectionProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="flex gap-6">
              <div className="w-36 h-36 bg-gray-200 rounded-xl"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-gray-200 rounded-full"></div>
                    <div className="h-4 w-20 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-4 w-16 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Tabs */}
      <div className="flex gap-3 mb-6">
        {TAB_OPTIONS.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={onTabChange}
          />
        ))}
      </div>

      {/* Feed Articles */}
      <div className="space-y-6">
        {posts.length > 0 ? (
          posts.map((post, index) => (
            <FeedPostCard key={post.id || index} post={post} />
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">No posts available</p>
            <p className="text-gray-400 text-sm mt-2">
              Be the first to create a post!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
