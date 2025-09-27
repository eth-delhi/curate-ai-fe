"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FileText, Edit2, BarChart2, Settings, Wallet } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { PostsTab } from "./PostsTab";
import { DraftsTab } from "./DraftsTab";
import { AnalyticsTab } from "./AnalyticsTab";
import { SettingsTab } from "./SettingsTab";
// WalletComponent import temporarily removed

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

interface Draft {
  id: string;
  title: string;
  lastEdited: string;
  completionPercentage: number;
}

interface UserData {
  name: string;
  username: string;
  bio: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
}

interface ProfileTabsProps {
  userPosts: Post[];
  draftPosts: Draft[];
  userData: UserData;
}

export const ProfileTabs = ({
  userPosts,
  draftPosts,
  userData,
}: ProfileTabsProps) => {
  const [activeTab, setActiveTab] = useState("posts");
  const searchParams = useSearchParams();

  useEffect(() => {
    setActiveTab(searchParams?.get("tabs") || "posts");
  }, [searchParams]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      <Tabs
        defaultValue="posts"
        className="w-full"
        onValueChange={setActiveTab}
      >
        <TabsList className="bg-white shadow-sm rounded-xl p-1 space-x-1 border border-gray-200 mb-8">
          <TabsTrigger
            value="posts"
            className="text-sm rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
          >
            <FileText className="h-4 w-4 mr-2" />
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="drafts"
            className="text-sm rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
          >
            <Edit2 className="h-4 w-4 mr-2" />
            Drafts
          </TabsTrigger>
          <TabsTrigger
            value="analytics"
            className="text-sm rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
          >
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="text-sm rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
          <TabsTrigger
            value="wallet"
            className="text-sm rounded-lg data-[state=active]:bg-blue-500 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
          >
            <Wallet className="h-4 w-4 mr-2" />
            Wallet
          </TabsTrigger>
        </TabsList>

        {/* Posts Tab */}
        <TabsContent value="posts">
          <PostsTab posts={userPosts} />
        </TabsContent>

        {/* Drafts Tab */}
        <TabsContent value="drafts">
          <DraftsTab drafts={draftPosts} />
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <AnalyticsTab topPosts={userPosts} />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SettingsTab userData={userData} />
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="mt-0">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100">
            <p className="text-gray-500">
              Wallet component will be integrated here
            </p>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
};
