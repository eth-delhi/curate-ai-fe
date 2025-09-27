"use client";

import { useState } from "react";
import { Zap, Star, Clock, BarChart3 } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BlogPostCard } from "./BlogPostCard";
import type { BlogPost } from "@/utils/types";

interface MainContentProps {
  blogPosts: BlogPost[];
}

export const MainContent = ({ blogPosts = [] }: MainContentProps) => {
  const [activeTab, setActiveTab] = useState("relevant");
  const [hoveredArticle, setHoveredArticle] = useState<string | null>(null);
  const [likedPosts, setLikedPosts] = useState<string[]>([]);
  const [savedPosts, setSavedPosts] = useState<string[]>([]);

  const handleLike = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLikedPosts((prev) =>
      prev.includes(id) ? prev.filter((postId) => postId !== id) : [...prev, id]
    );
  };

  const handleSave = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSavedPosts((prev) =>
      prev.includes(id) ? prev.filter((postId) => postId !== id) : [...prev, id]
    );
  };

  return (
    <main className="flex-1 px-4 sm:px-6 lg:px-8 lg:py-20 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Tabs
            defaultValue={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="bg-white shadow-sm rounded-full p-1 space-x-1 border border-gray-200">
              <TabsTrigger
                value="relevant"
                className="text-sm rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
              >
                <Star className="h-3.5 w-3.5 mr-1.5" />
                Relevant
              </TabsTrigger>
              <TabsTrigger
                value="latest"
                className="text-sm rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
              >
                <Clock className="h-3.5 w-3.5 mr-1.5" />
                Latest
              </TabsTrigger>
              <TabsTrigger
                value="top"
                className="text-sm rounded-full data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
              >
                <BarChart3 className="h-3.5 w-3.5 mr-1.5" />
                Top
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="space-y-4">
          {blogPosts.length === 0 ? (
            <p className="text-gray-500 text-center py-12 opacity-0 animate-fade-in">
              No blog posts available.
            </p>
          ) : (
            blogPosts.map((post, index) => (
              <BlogPostCard
                key={post.id}
                post={post}
                index={index}
                hoveredArticle={hoveredArticle}
                setHoveredArticle={setHoveredArticle}
                likedPosts={likedPosts}
                savedPosts={savedPosts}
                onLike={handleLike}
                onSave={handleSave}
              />
            ))
          )}
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        .animate-slide-in {
          animation: slide-in 0.5s ease-out 0.3s forwards;
        }

        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </main>
  );
};
