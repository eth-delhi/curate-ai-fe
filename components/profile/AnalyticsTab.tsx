"use client";

import { motion } from "framer-motion";
import {
  Eye,
  Heart,
  MessageSquare,
  TrendingUp,
  ChevronRight,
} from "lucide-react";

interface Post {
  id: string;
  title: string;
  views: number;
  likes: number;
  comments: number;
}

interface AnalyticsTabProps {
  topPosts: Post[];
}

export const AnalyticsTab = ({ topPosts }: AnalyticsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Views</h3>
            <Eye className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">24,892</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">12.5%</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Total Likes</h3>
            <Heart className="h-5 w-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">3,487</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">8.2%</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Total Comments
            </h3>
            <MessageSquare className="h-5 w-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">1,024</p>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
            <span className="text-green-500 font-medium">5.7%</span>
            <span className="text-gray-500 ml-1">vs last month</span>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Top Performing Posts
        </h3>
        <div className="space-y-4">
          {topPosts.slice(0, 3).map((post, index) => (
            <div
              key={post.id}
              className="flex items-center gap-4 p-3 rounded-lg hover:bg-blue-50/50"
            >
              <div className="font-bold text-2xl text-blue-500 opacity-50">
                {index + 1}
              </div>
              <div className="flex-grow">
                <h4 className="font-medium text-gray-900">{post.title}</h4>
                <div className="flex gap-4 text-sm text-gray-500 mt-1">
                  <span className="flex items-center">
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    {post.views}
                  </span>
                  <span className="flex items-center">
                    <Heart className="h-3.5 w-3.5 mr-1" />
                    {post.likes}
                  </span>
                  <span className="flex items-center">
                    <MessageSquare className="h-3.5 w-3.5 mr-1" />
                    {post.comments}
                  </span>
                </div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
