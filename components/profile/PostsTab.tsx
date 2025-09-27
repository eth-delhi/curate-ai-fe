"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageSquare, Eye, Clock } from "lucide-react";

interface Post {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  likes: number;
  comments: number;
  views: number;
  image?: string;
  tags: string[];
}

interface PostsTabProps {
  posts: Post[];
}

export const PostsTab = ({ posts }: PostsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-5">
                {/* Left content */}
                <div className="md:w-3/4">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {post.title}
                  </h2>

                  <p className="text-base text-gray-700 mb-4">{post.excerpt}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {post.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-blue-50 text-blue-600 border-blue-100 text-xs px-2 py-1"
                      >
                        #{tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center text-gray-500 text-sm">
                    <div className="flex items-center gap-1.5 mr-5">
                      <Heart className="h-4 w-4" />
                      <span>{post.likes}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mr-5">
                      <MessageSquare className="h-4 w-4" />
                      <span>{post.comments}</span>
                    </div>
                    <div className="flex items-center gap-1.5 mr-5">
                      <Eye className="h-4 w-4" />
                      <span>{post.views}</span>
                    </div>
                    <span className="flex items-center">
                      <Clock className="h-4 w-4 mr-1.5 text-blue-400" />
                      {post.readTime}
                    </span>
                  </div>
                </div>

                {/* Right image */}
                <div className="mt-4 md:mt-0 md:w-1/4">
                  <div className="relative rounded-lg overflow-hidden h-32 w-full">
                    <img
                      src={post.image || "/placeholder.svg"}
                      alt="Blog cover"
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-transparent opacity-50"></div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
