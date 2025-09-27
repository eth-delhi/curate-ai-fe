"use client";

import { ProfileBackgroundAnimation } from "@/components/profile/ProfileBackgroundAnimation";
import { ProfileHeader } from "@/components/profile/ProfileHeader";
import { ProfileTabs } from "@/components/profile/ProfileTabs";

export default function ProfilePage() {
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb] relative overflow-hidden">
      {/* Animated background */}
      <ProfileBackgroundAnimation />

      <div className="container mx-auto px-4 pt-24 pb-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Profile Header */}
          <ProfileHeader userData={userData} />

          {/* Profile Content Tabs */}
          <ProfileTabs
            userPosts={userPosts}
            draftPosts={draftPosts}
            userData={userData}
          />
        </div>
      </div>
    </div>
  );
}
