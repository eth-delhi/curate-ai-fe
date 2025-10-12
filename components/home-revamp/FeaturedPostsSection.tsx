"use client";

import { Bookmark } from "lucide-react";
import Image from "next/image";
import { FeaturedPostsSectionProps } from "@/types/home-revamp";
import { truncateText } from "@/utils/home-revamp";
import { useState } from "react";

const FeaturedPostCard = ({ post }: { post: any }) => {
  const [isBookmarked, setIsBookmarked] = useState(false);

  return (
    <article className="flex bg-white rounded-lg overflow-hidden hover:shadow-md transition-shadow duration-200 group">
      <div className="relative w-[35%] md:w-[40%]">
        <Image
          src={post.imageUrl || "/placeholder.svg"}
          alt={post.title}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 35vw, 20vw"
        />
      </div>

      <div className="flex-1 p-4 md:p-5 flex flex-col justify-between">
        <div>
          <h3 className="font-semibold text-sm md:text-base mb-2 line-clamp-2 group-hover:text-primary transition-colors">
            {post.title}
          </h3>
          <p className="text-xs text-gray-600 mb-3 line-clamp-2 md:line-clamp-3">
            {truncateText(post.content, 80)}
          </p>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`w-5 h-5 rounded-full bg-gradient-to-br flex-shrink-0 ${post.authorAvatar}`}
              aria-hidden="true"
            />
            <span className="text-xs text-gray-700 truncate">
              {post.author}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-xs text-gray-400">{post.timeAgo}</span>
            <button
              onClick={(e) => {
                e.preventDefault();
                setIsBookmarked(!isBookmarked);
              }}
              aria-label={isBookmarked ? "Remove bookmark" : "Bookmark post"}
              className="p-1 hover:bg-gray-100 rounded transition-colors"
            >
              <Bookmark
                className={`w-4 h-4 transition-colors ${
                  isBookmarked ? "fill-current text-primary" : "text-gray-400"
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};

const LoadingSkeleton = () => (
  <div className="flex bg-white rounded-lg overflow-hidden animate-pulse">
    <div className="w-[35%] md:w-[40%] bg-gray-200" />
    <div className="flex-1 p-4 md:p-5 space-y-3">
      <div className="h-4 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded" />
      <div className="h-3 bg-gray-200 rounded w-3/4" />
      <div className="flex justify-between items-center pt-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 bg-gray-200 rounded-full" />
          <div className="h-3 w-20 bg-gray-200 rounded" />
        </div>
        <div className="h-3 w-12 bg-gray-200 rounded" />
      </div>
    </div>
  </div>
);

export const FeaturedPostsSection = ({
  posts,
  isLoading,
}: FeaturedPostsSectionProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
        {Array.from({ length: 4 }).map((_, index) => (
          <LoadingSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="text-center py-12 mb-8">
        <p className="text-gray-500">No featured posts available</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 mb-8">
      {posts.map((post, index) => (
        <FeaturedPostCard key={post.id || index} post={post} />
      ))}
    </div>
  );
};
