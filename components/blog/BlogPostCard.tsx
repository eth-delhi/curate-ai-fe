"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, MessageSquare, Bookmark, Clock } from "lucide-react";
import type { BlogPost } from "@/utils/types";

interface BlogPostCardProps {
  post: BlogPost;
  index: number;
  hoveredArticle: string | null;
  setHoveredArticle: (id: string | null) => void;
  likedPosts: string[];
  savedPosts: string[];
  onLike: (id: string, e: React.MouseEvent) => void;
  onSave: (id: string, e: React.MouseEvent) => void;
}

// Sample blog cover images from Unsplash as fallback
const blogImages = [
  "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
];

export const BlogPostCard = ({
  post,
  index,
  hoveredArticle,
  setHoveredArticle,
  likedPosts,
  savedPosts,
  onLike,
  onSave,
}: BlogPostCardProps) => {
  const router = useRouter();

  // Utility to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInHours < 24) return `${diffInHours}h`;
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  // Placeholder author data (since BlogPost doesn't include author info)
  const getAuthorInfo = (index: number) => {
    const authors = [
      { initials: "CM", name: "Casey Morgan, PhD" },
      { initials: "SD", name: "Sam Doe" },
      { initials: "RZD", name: "Dakota Chen, Consultant" },
      { initials: "SA", name: "Sarah Adams" },
    ];
    return authors[index % authors.length];
  };

  const author = getAuthorInfo(index);

  return (
    <article
      className="group cursor-pointer bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 hover:scale-[1.02] border border-gray-200/50 overflow-hidden"
      onClick={() => router.push(`/post/${post.id}?cid=${post.internal_id}`)}
      onMouseEnter={() => setHoveredArticle(post.id)}
      onMouseLeave={() => setHoveredArticle(null)}
      style={{
        animationDelay: `${index * 0.1}s`,
      }}
    >
      <div className="p-8">
        <div className="flex flex-col lg:flex-row gap-6 w-full">
          {/* Left content */}
          <div className="lg:w-3/4 flex-1 w-full">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 text-white flex items-center justify-center rounded-xl text-sm font-bold mr-4 shadow-lg">
                {author.initials}
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">
                  {author.name}
                </p>
                <p className="text-xs text-gray-500 font-medium">
                  {formatDate(post.date)}
                </p>
              </div>

              {hoveredArticle === post.id && (
                <button className="ml-2 text-gray-400 hover:text-blue-500 transition-all duration-300 opacity-0 group-hover:opacity-100 transform hover:scale-110">
                  <span className="text-xl">⋯</span>
                </button>
              )}
            </div>

            <h2 className="text-2xl font-bold text-gray-900 mb-4 hover:text-blue-600 transition-colors leading-tight group-hover:text-blue-600">
              {post.title}
            </h2>

            <p className="text-base text-gray-600 mb-6 line-clamp-3 leading-relaxed">
              {post.content}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <button
                  className={`flex items-center gap-2 px-3 py-2 rounded-full transition-all duration-300 transform hover:scale-105 ${
                    likedPosts.includes(post.id)
                      ? "text-red-500 bg-red-50"
                      : "text-gray-500 hover:text-red-500 hover:bg-red-50"
                  }`}
                  onClick={(e) => onLike(post.id, e)}
                >
                  <Heart
                    className={`h-4 w-4 ${
                      likedPosts.includes(post.id) ? "fill-red-500" : ""
                    }`}
                  />
                  <span className="font-medium">{Math.floor(post.score)}</span>
                </button>

                <button className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 hover:text-blue-500 hover:bg-blue-50 transition-all duration-300 transform hover:scale-105">
                  <MessageSquare className="h-4 w-4" />
                  <span className="font-medium">
                    {Math.floor(post.userRating)}
                  </span>
                </button>

                <span className="flex items-center gap-2 px-3 py-2 rounded-full text-gray-500 bg-gray-50">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">{formatDate(post.date)}</span>
                </span>
              </div>

              {hoveredArticle === post.id && (
                <div className="flex opacity-0 group-hover:opacity-100 transition-all duration-300">
                  <button
                    className={`h-10 w-10 rounded-full transition-all duration-300 transform hover:scale-110 ${
                      savedPosts.includes(post.id)
                        ? "text-blue-500 bg-blue-100"
                        : "text-gray-400 hover:text-blue-500 hover:bg-blue-100"
                    }`}
                    onClick={(e) => onSave(post.id, e)}
                  >
                    <Bookmark
                      className={`h-4 w-4 mx-auto ${
                        savedPosts.includes(post.id) ? "fill-blue-500" : ""
                      }`}
                    />
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Right image */}
          <div className="mt-4 lg:mt-0 lg:w-1/4">
            <div className="relative rounded-2xl overflow-hidden h-40 w-full group">
              <img
                src={
                  post.imageUrl ||
                  blogImages[index % blogImages.length] ||
                  "/placeholder.svg"
                }
                alt={`${post.title} cover`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-gray-700">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </article>
  );
};
