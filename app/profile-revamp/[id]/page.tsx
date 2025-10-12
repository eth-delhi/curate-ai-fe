"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Home,
  Compass,
  BookOpen,
  User,
  Settings,
  Info,
  Edit2,
  Calendar,
  MapPin,
  LinkIcon,
  Twitter,
  Github,
  Settings as SettingsIcon,
  FileText,
  BarChart2,
  Wallet,
  Heart,
  MessageSquare,
  Eye,
  Clock,
  Send,
  MoreHorizontal,
  Bell,
  Hash,
  Edit,
} from "lucide-react";
const SIDEBAR_ITEMS = [
  { id: "home", icon: Home, label: "Home" },
  { id: "notifications", icon: Bell, label: "Notifications" },
  { id: "explore", icon: Compass, label: "Explore" },
  { id: "bookmarks", icon: BookOpen, label: "Bookmarks" },
  { id: "tags", icon: Hash, label: "Tags" },
  { id: "write", icon: Edit, label: "Write" },
];

export default function ProfileRevampPage() {
  const [activeSidebarItem, setActiveSidebarItem] = useState("profile");
  const [activeTab, setActiveTab] = useState("posts");

  // Dummy user data
  const userData = {
    name: "Alex Johnson",
    username: "alexjohnson",
    avatar: "/placeholder.svg?height=200&width=200",
    bio: "Blockchain developer and writer. Passionate about decentralized technologies and their potential to transform industries.",
    location: "San Francisco, CA",
    website: "https://alexjohnson.dev",
    twitter: "@alexjohnson",
    github: "alexjohnson",
    joinDate: "January 2022",
    followers: 1243,
    following: 567,
    posts: 42,
  };

  // Dummy posts data
  const userPosts = [
    {
      id: "1",
      title: "Understanding Zero-Knowledge Proofs: A Comprehensive Guide",
      excerpt:
        "Zero-knowledge proofs allow one party to prove to another that a statement is true without revealing any additional information.",
      date: "2 days ago",
      readTime: "8 min read",
      likes: 124,
      comments: 32,
      views: 1890,
      image:
        "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop",
      tags: ["blockchain", "cryptography", "privacy"],
    },
    {
      id: "2",
      title: "The Evolution of Smart Contract Platforms",
      excerpt:
        "From Ethereum to newer platforms like Solana and Avalanche, this article explores the evolution of smart contract technology.",
      date: "1 week ago",
      readTime: "12 min read",
      likes: 256,
      comments: 48,
      views: 3420,
      image:
        "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1000&auto=format&fit=crop",
      tags: ["blockchain", "ethereum", "smart-contracts"],
    },
    {
      id: "3",
      title: "Building Decentralized Applications: Best Practices",
      excerpt:
        "Learn the best practices for designing, developing, and deploying decentralized applications on modern blockchain platforms.",
      date: "2 weeks ago",
      readTime: "10 min read",
      likes: 189,
      comments: 27,
      views: 2150,
      image:
        "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1000&auto=format&fit=crop",
      tags: ["dapps", "development", "web3"],
    },
  ];

  // Dummy draft posts
  const draftPosts = [
    {
      id: "draft1",
      title: "The Future of Decentralized Finance",
      lastEdited: "Yesterday",
      completionPercentage: 85,
    },
    {
      id: "draft2",
      title: "NFTs Beyond Digital Art: Real-World Applications",
      lastEdited: "3 days ago",
      completionPercentage: 60,
    },
  ];

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f0] checkered-bg">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap");
        * {
          font-family: "Poppins", sans-serif;
        }

        /* Subtle checkered texture */
        .checkered-bg {
          background-image: linear-gradient(
              45deg,
              rgba(0, 0, 0, 0.02) 25%,
              transparent 25%
            ),
            linear-gradient(-45deg, rgba(0, 0, 0, 0.02) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.02) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.02) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }

        .prose {
          --tw-prose-headings: #374151;
          --tw-prose-body: #4b5563;
          --tw-prose-links: #374151;
          --tw-prose-bold: #111827;
          --tw-prose-counters: #6b7280;
          --tw-prose-bullets: #d1d5db;
          --tw-prose-hr: #e5e7eb;
          --tw-prose-quotes: #374151;
          --tw-prose-quote-borders: #e5e7eb;
          --tw-prose-captions: #6b7280;
          --tw-prose-code: #111827;
          --tw-prose-pre-code: #e5e7eb;
          --tw-prose-pre-bg: #1f2937;
          --tw-prose-th-borders: #d1d5db;
          --tw-prose-td-borders: #e5e7eb;
        }
      `}</style>

      {/* Top Navbar - Full Width */}
      <div className="bg-white border-b border-gray-100 py-2 px-8 flex items-center justify-between">
        <div className="flex items-center gap-12 ml-[12px]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center">
              <div className="w-6 h-6 rounded-full bg-white"></div>
            </div>
            <h1 className="text-xl font-light text-gray-900">CurateAi</h1>
          </div>
          <div className="relative flex-1 max-w-lg">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
            <Input
              placeholder="Search..."
              className="pl-11 bg-gray-50 border-gray-100 rounded-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-12">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
            <span className="font-semibold">Amir Yahyaei</span>
            <button className="w-8 h-8 hover:bg-gray-100 rounded-full flex items-center justify-center">
              <Info className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <div className="w-[125px] border-r border-gray-100 bg-gray-50 flex flex-col items-center py-8 gap-8 justify-between relative">
          <nav className="flex flex-col gap-6">
            {SIDEBAR_ITEMS.map(({ id, icon: Icon, label }) => (
              <button
                key={id}
                className={`w-12 h-12 rounded-xl flex items-center justify-center relative group transition-colors ${
                  activeSidebarItem === id
                    ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-sm"
                    : "hover:bg-gray-100"
                }`}
                onClick={() => setActiveSidebarItem(id)}
              >
                <Icon
                  className={`w-5 h-5 ${
                    activeSidebarItem === id ? "text-white" : "text-gray-500"
                  }`}
                />
                <span className="absolute left-full ml-2 px-3 py-1.5 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                  {label}
                </span>
              </button>
            ))}
          </nav>

          {/* Logout Button - Positioned 20px from bottom */}
          <div className="absolute bottom-5">
            <button className="w-12 h-12 hover:bg-red-100 rounded-xl flex items-center justify-center relative group transition-colors">
              <svg
                className="w-5 h-5 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="absolute left-full ml-2 px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
                Logout
              </span>
            </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-10">
            <div className="p-8">
              {/* Profile Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl p-8 shadow-sm border border-gray-100 mb-8"
              >
                <div className="flex flex-col md:flex-row gap-8 items-start">
                  <div className="flex-shrink-0">
                    <Avatar className="h-32 w-32 border-4 border-gray-200 shadow-lg">
                      <AvatarImage
                        src={userData.avatar || "/placeholder.svg"}
                        alt={userData.name}
                      />
                      <AvatarFallback className="text-3xl bg-gray-600 text-white">
                        {userData.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </AvatarFallback>
                    </Avatar>
                  </div>

                  <div className="flex-grow">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
                      <div>
                        <h1 className="text-3xl font-bold text-gray-900">
                          {userData.name}
                        </h1>
                        <p className="text-gray-500">@{userData.username}</p>
                      </div>
                      <div className="flex gap-3">
                        <Button className="bg-gray-800 hover:bg-gray-900 text-white">
                          <Edit2 className="h-4 w-4 mr-2" />
                          Edit Profile
                        </Button>
                        <Button
                          variant="outline"
                          className="border-gray-300 text-gray-600"
                        >
                          <SettingsIcon className="h-4 w-4 mr-2" />
                          Settings
                        </Button>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4">{userData.bio}</p>

                    <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-gray-600 mb-6">
                      {userData.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                          {userData.location}
                        </div>
                      )}
                      {userData.website && (
                        <div className="flex items-center">
                          <LinkIcon className="h-4 w-4 mr-2 text-gray-400" />
                          <a
                            href={userData.website}
                            className="text-gray-600 hover:underline"
                          >
                            {userData.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                      {userData.joinDate && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-400" />
                          Joined {userData.joinDate}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-4">
                      {userData.twitter && (
                        <a
                          href={`https://twitter.com/${userData.twitter.replace(
                            "@",
                            ""
                          )}`}
                          className="flex items-center text-gray-600 hover:text-gray-800"
                        >
                          <Twitter className="h-5 w-5 mr-1" />
                          <span>{userData.twitter}</span>
                        </a>
                      )}
                      {userData.github && (
                        <a
                          href={`https://github.com/${userData.github}`}
                          className="flex items-center text-gray-700 hover:text-gray-900"
                        >
                          <Github className="h-5 w-5 mr-1" />
                          <span>{userData.github}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {userData.posts}
                    </p>
                    <p className="text-sm text-gray-600">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {userData.followers.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">
                      {userData.following.toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-600">Following</p>
                  </div>
                </div>
              </motion.div>

              {/* Profile Content Tabs */}
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
                      className="text-sm rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Posts
                    </TabsTrigger>
                    <TabsTrigger
                      value="drafts"
                      className="text-sm rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
                    >
                      <Edit2 className="h-4 w-4 mr-2" />
                      Drafts
                    </TabsTrigger>
                    <TabsTrigger
                      value="analytics"
                      className="text-sm rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
                    >
                      <BarChart2 className="h-4 w-4 mr-2" />
                      Analytics
                    </TabsTrigger>
                    <TabsTrigger
                      value="settings"
                      className="text-sm rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
                    >
                      <SettingsIcon className="h-4 w-4 mr-2" />
                      Settings
                    </TabsTrigger>
                    <TabsTrigger
                      value="wallet"
                      className="text-sm rounded-lg data-[state=active]:bg-gray-800 data-[state=active]:text-white text-gray-600 px-4 py-2 transition-all"
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Wallet
                    </TabsTrigger>
                  </TabsList>

                  {/* Posts Tab */}
                  <TabsContent value="posts">
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 gap-6">
                        {userPosts.map((post) => (
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

                                  <p className="text-base text-gray-700 mb-4">
                                    {post.excerpt}
                                  </p>

                                  <div className="flex flex-wrap gap-2 mb-4">
                                    {post.tags.map((tag) => (
                                      <Badge
                                        key={tag}
                                        variant="outline"
                                        className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                                      >
                                        #{tag}
                                      </Badge>
                                    ))}
                                  </div>

                                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                                    <div className="flex items-center">
                                      <Clock className="h-4 w-4 mr-1" />
                                      {post.readTime}
                                    </div>
                                    <div className="flex items-center">
                                      <Calendar className="h-4 w-4 mr-1" />
                                      {post.date}
                                    </div>
                                  </div>
                                </div>

                                {/* Right content - Image */}
                                {post.image && (
                                  <div className="md:w-1/4">
                                    <div className="aspect-video rounded-lg overflow-hidden">
                                      <img
                                        src={post.image}
                                        alt={post.title}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Bottom stats */}
                              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                <div className="flex items-center gap-6">
                                  <div className="flex items-center text-gray-600">
                                    <Heart className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                      {post.likes}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <MessageSquare className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                      {post.comments}
                                    </span>
                                  </div>
                                  <div className="flex items-center text-gray-600">
                                    <Eye className="h-4 w-4 mr-1" />
                                    <span className="text-sm">
                                      {post.views}
                                    </span>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 text-gray-600"
                                  >
                                    Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-gray-300 text-gray-600"
                                  >
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>

                  {/* Drafts Tab */}
                  <TabsContent value="drafts">
                    <div className="space-y-6">
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">
                          Your Drafts
                        </h2>
                        <div className="space-y-4">
                          {draftPosts.map((draft) => (
                            <div
                              key={draft.id}
                              className="p-4 border border-gray-200 rounded-lg hover:border-gray-300 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex justify-between items-start">
                                <div>
                                  <h3 className="font-medium text-gray-900">
                                    {draft.title}
                                  </h3>
                                  <p className="text-sm text-gray-500">
                                    Last edited: {draft.lastEdited}
                                  </p>
                                </div>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="border-gray-300 text-gray-600"
                                >
                                  Continue Editing
                                </Button>
                              </div>
                              <div className="mt-3">
                                <div className="w-full bg-gray-200 rounded-full h-2.5">
                                  <div
                                    className="bg-gray-600 h-2.5 rounded-full"
                                    style={{
                                      width: `${draft.completionPercentage}%`,
                                    }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">
                                  {draft.completionPercentage}% complete
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Analytics Tab */}
                  <TabsContent value="analytics">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Analytics
                      </h2>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">
                            1,234
                          </p>
                          <p className="text-sm text-gray-600">Total Views</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">
                            567
                          </p>
                          <p className="text-sm text-gray-600">Total Likes</p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                          <p className="text-2xl font-bold text-gray-900">89</p>
                          <p className="text-sm text-gray-600">
                            Total Comments
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Settings Tab */}
                  <TabsContent value="settings">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Settings
                      </h2>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Display Name
                          </label>
                          <Input
                            defaultValue={userData.name}
                            className="border-gray-300"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bio
                          </label>
                          <textarea
                            defaultValue={userData.bio}
                            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                            rows={3}
                          />
                        </div>
                        <Button className="bg-gray-800 hover:bg-gray-900 text-white">
                          Save Changes
                        </Button>
                      </div>
                    </div>
                  </TabsContent>

                  {/* Wallet Tab */}
                  <TabsContent value="wallet" className="mt-0">
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                      <h2 className="text-xl font-bold text-gray-900 mb-4">
                        Wallet
                      </h2>
                      <p className="text-gray-500">
                        Wallet component will be integrated here
                      </p>
                    </div>
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
