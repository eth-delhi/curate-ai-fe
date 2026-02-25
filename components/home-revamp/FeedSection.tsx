"use client";

import { Bookmark, MessageCircle, X } from "lucide-react";
import { PiHandsClappingThin } from "react-icons/pi";
import { FeedSectionProps } from "@/types/home-revamp";
import { TAB_OPTIONS } from "@/constants/home-revamp";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useCallback } from "react";

const FeedPostCard = ({ post }: { post: any }) => {
  const router = useRouter();

  // Get author information - use real data if available
  const authorName = post.authorFullName || post.author || "Anonymous";
  const authorUuid = post.authorUuid;

  // Get profile picture - use real IPFS URL if available, otherwise fallback
  const avatarUrl = post.authorProfilePic
    ? `https://gateway.pinata.cloud/ipfs/${post.authorProfilePic}`
    : post.authorAvatar ||
      `https://i.pravatar.cc/150?img=${Math.floor(Math.random() * 70) + 1}`;

  // Use real tags from API, format with # prefix
  const tags =
    post.tags && post.tags.length > 0
      ? post.tags.map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`))
      : [];

  // Engagement metrics
  const clapCount = post.clapCount || 0;
  const commentCount = post.commentCount || 0;

  // Handle author click - navigate to profile if UUID is available
  const handleAuthorClick = (e: React.MouseEvent) => {
    if (authorUuid) {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/profile-revamp/${authorUuid}`);
    }
  };

  return (
    <Link href={`/post-revamp/${post.uuid || post.id}`}>
      <article className="bg-white border-b border-gray-200 py-4 px-6 cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          {/* Main Content - Column Layout */}
          <div className="flex-1 min-w-0">
            {/* Author Info */}
            <div className="flex items-center gap-2 mb-2">
              {authorUuid ? (
                <button
                  onClick={handleAuthorClick}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer"
                >
                  <img
                    src={avatarUrl}
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover cursor-pointer"
                  />
                  <span className="text-sm font-medium text-gray-900 hover:text-blue-600 transition-colors cursor-pointer">
                    {authorName}
                  </span>
                </button>
              ) : (
                <>
                  <img
                    src={avatarUrl}
                    alt={authorName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    {authorName}
                  </span>
                </>
              )}
              <span className="text-sm text-gray-500">·</span>
              <span className="text-sm text-gray-500">
                {post.timeAgo || "Nov 4"}
              </span>
            </div>

            {/* Thumbnail Image - Above Title in Column */}
            {post.imageUrl && (
              <div className="mb-2 rounded-lg overflow-hidden bg-gray-100 aspect-[16/10]">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Title */}
            <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-blue-800 transition-colors">
              {post.title}
            </h3>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {tags.slice(0, 4).map((tag: string, index: number) => (
                  <span
                    key={index}
                    className="text-sm text-gray-600 hover:text-blue-600 cursor-pointer"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Engagement Metrics */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1.5">
                <PiHandsClappingThin className="w-4 h-4" />
                <span>{clapCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                <span>{commentCount}</span>
              </div>
              <span className="text-gray-500">
                {post.readTime || "0 min read"}
              </span>
            </div>
          </div>

          {/* Bookmark Icon - Right Side */}
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
            className="p-2 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            aria-label="Bookmark"
          >
            <Bookmark className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </article>
    </Link>
  );
};

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
    className={`px-4 py-2 text-sm font-medium transition-colors relative cursor-pointer ${
      isActive
        ? "text-gray-900 font-semibold"
        : "text-gray-600 hover:text-gray-900"
    }`}
    onClick={() => onClick(tab.id)}
  >
    {tab.label}
    {isActive && (
      <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
    )}
  </button>
);

export const FeedSection = ({
  posts,
  activeTab,
  onTabChange,
  isLoading,
  selectedTag,
  onClearTagFilter,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: FeedSectionProps) => {
  // Intersection Observer for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  // Load more when observer target comes into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          onLoadMore
        ) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1, // Trigger when 10% of the element is visible
        rootMargin: "100px", // Start loading 100px before reaching the bottom
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);
  if (isLoading) {
    return (
      <div className="bg-white rounded-lg">
        <div className="flex gap-1 border-b border-gray-200 px-6 pt-4 pb-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-8 w-20 bg-gray-200 rounded animate-pulse mr-4"
            ></div>
          ))}
        </div>
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className="border-b border-gray-200 py-6 px-6 animate-pulse"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                <div className="h-4 w-32 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
              <div className="flex gap-2 mb-3">
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
                <div className="h-4 w-16 bg-gray-200 rounded"></div>
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
                <div className="h-4 w-12 bg-gray-200 rounded"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg">
      {/* Active Tag Filter */}
      {selectedTag && (
        <div className="px-6 pt-4 pb-2 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Filtered by:</span>
            <Badge
              variant="secondary"
              className="bg-gray-100 text-gray-900 px-3 py-1 text-sm font-medium"
            >
              #{selectedTag}
            </Badge>
            {onClearTagFilter && (
              <button
                onClick={onClearTagFilter}
                className="ml-2 p-1 hover:bg-gray-100 rounded transition-colors"
                aria-label="Clear tag filter"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 px-6 pt-4">
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
      <div>
        {posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <FeedPostCard key={post.id || post.uuid || index} post={post} />
            ))}
            {/* Infinite scroll trigger element */}
            {hasNextPage && (
              <div
                ref={observerTarget}
                className="h-20 flex items-center justify-center"
              >
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-gray-500">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
                    <span className="text-sm">Loading more posts...</span>
                  </div>
                )}
              </div>
            )}
            {/* End of feed message */}
            {!hasNextPage && posts.length > 0 && (
              <div className="text-center py-8 px-6">
                <p className="text-gray-400 text-sm">You've reached the end</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 px-6">
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
