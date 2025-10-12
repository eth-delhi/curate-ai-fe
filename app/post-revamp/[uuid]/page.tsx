"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  MessageSquare,
  Flag,
  Share2,
  Calendar,
  Clock,
  ThumbsUp,
  Send,
  User,
  Loader2,
  AlertCircle,
  Coins,
  Sparkles,
} from "lucide-react";
import HomeNavbar from "@/components/ui/HomeNavbar";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useSinglePost } from "@/hooks/api/posts";
import { useAccount } from "wagmi";
import { contract } from "@/constants/contract";
import {
  useReadCuratAiTokenBalanceOf,
  useWriteCurateAiVoteVote,
  useReadCurateAiPostsGetPostScore,
} from "@/hooks/wagmi/contracts";
import { CommentsSection } from "@/components/comments/CommentsSection";
import {
  useCreateScore,
  useUpdateScore,
  useDailyVotePercentage,
} from "@/hooks/api/scores";
import { showToast } from "@/utils/showToast";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false }
);

interface BlogPostViewProps {
  params: {
    uuid: string;
  };
}

const DUMMY_USERS = [
  { name: "Alena Gouse", following: false },
  { name: "Ruben Bator", following: true },
  { name: "Aspen Stanton", following: false },
  { name: "Madelyn George", following: false },
];

const DUMMY_TRENDS = [
  { title: "Be the Person You Are on Vacation", author: "Maren Torff" },
  { title: "Hate NFTs? I have some bad news for...", author: "Zain Levin" },
  { title: "The real impact of dark UX patterns", author: "Lindsey Curtis" },
];

const DUMMY_TOPICS = [
  "Technology",
  "Design Thinking",
  "Crypto",
  "NFT",
  "Personal Growth",
  "Reading",
];

export default function BlogPostView({ params }: BlogPostViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const cid = searchParams?.get("cid") || "0";
  const { address: userAddress } = useAccount();

  // Fetch post data from API
  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useSinglePost(params.uuid);

  // Fetch user token balance
  const { data: tokenBalance } = useReadCuratAiTokenBalanceOf({
    address: contract.token as `0x${string}`,
    args: [userAddress as `0x${string}`],
  });

  // Fetch post score from blockchain
  const { data: postScore } = useReadCurateAiPostsGetPostScore({
    address: contract.post as `0x${string}`,
    args: [BigInt(+cid)],
  });

  // Voting contract interaction
  const { writeContractAsync, isPending: isScorePending } =
    useWriteCurateAiVoteVote();

  // API hooks for scoring
  const createScoreMutation = useCreateScore();
  const updateScoreMutation = useUpdateScore();

  // Fetch daily vote percentage using wallet address (same as scoring)
  const { data: dailyVoteData, isLoading: isDailyVoteLoading } =
    useDailyVotePercentage(userAddress || "");

  // State for voting
  const [voteWeight, setVoteWeight] = useState(50); // Percentage for slider
  const [voteValue, setVoteValue] = useState<bigint | undefined>(BigInt(0));
  const [hasClapped, setHasClapped] = useState(false);
  const [clapCount, setClapCount] = useState(0);
  const [hasFlagged, setHasFlagged] = useState(false);

  // Update voteValue when voteWeight or tokenBalance changes
  useEffect(() => {
    if (tokenBalance) {
      const newValue = (tokenBalance * BigInt(voteWeight)) / BigInt(100);
      setVoteValue(newValue);
    }
  }, [voteWeight, tokenBalance]);

  // Handle voting with API integration
  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userAddress) {
      showToast({
        message: "Please connect your wallet to score posts",
        type: "error",
      });
      return;
    }

    if (!voteValue || isScorePending) {
      return;
    }

    try {
      console.log("Starting scoring process...");

      // Step 1: Create score in database
      console.log("Step 1: Creating score in database...");
      console.log("Vote percentage:", voteWeight);
      console.log("Vote quantity:", Number(voteValue));
      const scoreData = await createScoreMutation.mutateAsync({
        postUuid: params.uuid,
        userWalletAddress: userAddress,
        quantity: Number(voteValue),
        votePercentage: voteWeight,
      });
      console.log("Score created:", scoreData);

      // Step 2: Execute blockchain transaction
      console.log("Step 2: Executing blockchain transaction...");
      console.log("Contract address:", contract.post);
      console.log("Arguments:", [BigInt(+cid), voteValue]);

      let txResult;
      let blockchainError = false;
      try {
        txResult = await writeContractAsync({
          address: contract.vote as `0x${string}`,
          args: [BigInt(+cid), voteValue],
        });
        console.log("Transaction result:", txResult);
      } catch (txError) {
        console.error("Blockchain transaction failed:", txError);
        blockchainError = true;
        txResult = null;
      }

      // Handle different return types from wagmi
      let txHash: string | undefined;
      if (blockchainError) {
        console.log("Blockchain transaction failed, no hash available");
        txHash = undefined;
      } else if (typeof txResult === "string") {
        txHash = txResult;
      } else if (
        txResult &&
        typeof txResult === "object" &&
        "hash" in txResult
      ) {
        txHash = (txResult as { hash: string }).hash;
      } else {
        console.error("No transaction hash received:", txResult);
        txHash = undefined;
      }

      console.log("Transaction hash:", txHash);

      // Step 3: Update score with transaction hash or mark as failed
      console.log("Step 3: Updating score...");
      console.log("Score UUID:", scoreData.uuid);
      console.log("Transaction hash:", txHash);
      console.log("Status:", txHash ? "VERIFIED" : "BLOCKCHAIN_FAILED");

      try {
        await updateScoreMutation.mutateAsync({
          scoreUuid: scoreData.uuid,
          txHash,
          status: txHash ? "VERIFIED" : "BLOCKCHAIN_FAILED",
        });
        console.log("Update score API call completed");
      } catch (updateError) {
        console.error("Update score failed:", updateError);
        throw updateError;
      }

      if (txHash) {
        console.log("Score updated successfully with transaction hash");
      } else {
        console.log("Score marked as BLOCKCHAIN_FAILED");
      }

      if (txHash) {
        showToast({
          message: `Successfully scored ${voteValue.toString()} points!`,
          type: "success",
        });
      } else {
        showToast({
          message: `Score recorded but blockchain transaction failed. Please try again.`,
          type: "warning",
        });
      }
    } catch (error) {
      console.error("Scoring error:", error);
      showToast({
        message: "Failed to score post. Please try again.",
        type: "error",
      });
    }
  };

  // Handle clap
  const handleClap = () => {
    setClapCount((prev) => prev + 1);
    setHasClapped(true);
    setTimeout(() => setHasClapped(false), 300);
  };

  // Handle flag
  const handleFlag = () => {
    setHasFlagged(!hasFlagged);
  };

  // Loading state
  if (isPostLoading) {
    return (
      <div className="flex h-screen bg-[#e8e7ed] items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-gray-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (postError || !postData) {
    return (
      <div className="flex h-screen bg-[#e8e7ed] items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mb-4 text-red-500 mx-auto" />
          <p className="text-xl font-semibold text-gray-900 mb-2">
            Blog post not found
          </p>
          <p className="text-gray-600">
            The post you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

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
        /* Override slider blue colors */
        [data-radix-slider-track] {
          background-color: #e5e7eb !important;
        }
        [data-radix-slider-range] {
          background-color: #4b5563 !important;
        }
        [data-radix-slider-thumb] {
          background-color: #4b5563 !important;
          border-color: #4b5563 !important;
        }
        [data-radix-slider-thumb]:hover {
          background-color: #374151 !important;
          border-color: #374151 !important;
        }
      `}</style>

      {/* Top Navbar */}
      <HomeNavbar />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-10">
            <div className="p-8">
              {/* Article Header */}
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                  {postData.title}
                </h1>

                <div className="flex flex-wrap items-center gap-4 mb-6">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3 border border-gray-200">
                      <AvatarImage src="/placeholder-user.jpg" alt="Author" />
                      <AvatarFallback>AU</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-gray-900">
                        {postData.author?.email ||
                          postData.authorAddress ||
                          "Anonymous"}
                      </p>
                      <p className="text-sm text-gray-500">Author</p>
                    </div>
                  </div>

                  <Separator
                    orientation="vertical"
                    className="h-8 hidden sm:block"
                  />

                  <div className="flex items-center text-gray-500 text-sm">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>
                      {postData.aiRating?.createdAt
                        ? formatDistanceToNow(
                            new Date(postData.aiRating.createdAt),
                            {
                              addSuffix: true,
                            }
                          )
                        : "Recently"}
                    </span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm">
                    <Clock className="h-4 w-4 mr-1" />
                    <span>5 min read</span>
                  </div>

                  <div className="flex items-center text-gray-500 text-sm">
                    <ThumbsUp className="h-4 w-4 mr-1 text-gray-600" />
                    <span className="font-medium">
                      {postScore ? postScore.toString() : "0"} votes
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {postData.aiRating?.secondaryTopics?.map((topic) => (
                    <Badge
                      key={topic}
                      variant="outline"
                      className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                    >
                      #{topic}
                    </Badge>
                  )) ||
                    ["blockchain", "web3", "development"].map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"
                      >
                        #{tag}
                      </Badge>
                    ))}
                </div>
              </div>

              {/* Article Content */}
              <div className="bg-white rounded-xl p-6 mb-8">
                <article className="prose prose-gray max-w-none">
                  <MarkdownPreview source={postData.content || ""} />
                </article>
              </div>

              {/* Interaction Bar */}
              <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-6">
                    {/* Vote with Weight Slider */}
                    <div className="flex items-center">
                      <Button
                        variant={voteValue ? "default" : "outline"}
                        size="sm"
                        onClick={handleVote}
                        disabled={isScorePending || !voteValue}
                        className={`mr-2 ${
                          voteValue
                            ? "bg-gray-800 text-white"
                            : "text-gray-600 border-gray-300"
                        }`}
                      >
                        {isScorePending ? (
                          <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                        ) : (
                          <ThumbsUp className="h-4 w-4 mr-1.5" />
                        )}
                        <span>Score</span>
                      </Button>

                      <div className="hidden sm:flex items-center gap-2 w-32">
                        <Slider
                          value={[voteWeight]}
                          min={0}
                          max={100}
                          step={1}
                          onValueChange={(value) => setVoteWeight(value[0])}
                          className="w-full [&_[role=slider]]:bg-gray-600 [&_[role=slider]]:border-gray-600 [&_.slider-track]:bg-gray-200 [&_.slider-range]:bg-gray-600"
                        />
                        <span className="text-xs text-gray-500 w-8">
                          {voteWeight}%
                        </span>
                      </div>
                    </div>

                    {/* Post Score Display */}
                    <div className="flex items-center gap-1.5 text-gray-600">
                      <ThumbsUp className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">
                        {postScore ? postScore.toString() : "0"} votes
                      </span>
                    </div>

                    {/* Clap Button */}
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      animate={hasClapped ? { scale: [1, 1.2, 1] } : {}}
                      transition={{ duration: 0.3 }}
                      onClick={handleClap}
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
                    >
                      <Heart
                        className={`h-5 w-5 ${
                          hasClapped ? "fill-red-500 text-red-500" : ""
                        }`}
                      />
                      <span>{clapCount}</span>
                    </motion.button>

                    {/* Comments Count */}
                    <button
                      onClick={() =>
                        document
                          .getElementById("comments-section")
                          ?.scrollIntoView({ behavior: "smooth" })
                      }
                      className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800"
                    >
                      <MessageSquare className="h-5 w-5" />
                      <span>Comments</span>
                    </button>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Flag Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleFlag}
                      className={hasFlagged ? "text-red-500" : "text-gray-500"}
                    >
                      <Flag
                        className={`h-4 w-4 ${
                          hasFlagged ? "fill-red-100" : ""
                        }`}
                      />
                    </Button>

                    {/* Share Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        navigator.clipboard.writeText(window.location.href)
                      }
                      className="text-gray-500"
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Token Balance */}
                <div className="mt-4 text-sm text-gray-600 flex items-center">
                  <Coins className="w-4 h-4 mr-1" />
                  Your balance: {tokenBalance?.toString() || "0"} SMT
                </div>

                {/* Daily Vote Percentage */}
                <div className="mt-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                    <span className="flex items-center">
                      <ThumbsUp className="w-4 h-4 mr-1" />
                      Daily voting limit
                    </span>
                    {isDailyVoteLoading ? (
                      <span className="text-gray-400">Loading...</span>
                    ) : dailyVoteData ? (
                      <span className="font-medium">
                        {dailyVoteData.totalVotePercentage} / 500
                      </span>
                    ) : (
                      <span className="text-gray-400">0 / 500</span>
                    )}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        isDailyVoteLoading
                          ? "bg-gray-300 animate-pulse"
                          : dailyVoteData &&
                            dailyVoteData.totalVotePercentage >= 500
                          ? "bg-red-500"
                          : dailyVoteData &&
                            dailyVoteData.totalVotePercentage >= 400
                          ? "bg-yellow-500"
                          : "bg-gray-600"
                      }`}
                      style={{
                        width: isDailyVoteLoading
                          ? "0%"
                          : dailyVoteData
                          ? `${Math.min(
                              (dailyVoteData.totalVotePercentage / 500) * 100,
                              100
                            )}%`
                          : "0%",
                      }}
                    />
                  </div>
                  {isDailyVoteLoading ? (
                    <div className="mt-1 text-xs text-gray-400">
                      Loading vote data...
                    </div>
                  ) : dailyVoteData ? (
                    <div className="mt-1 text-xs text-gray-500">
                      {dailyVoteData.voteCount} vote
                      {dailyVoteData.voteCount !== 1 ? "s" : ""} used today
                    </div>
                  ) : (
                    <div className="mt-1 text-xs text-gray-500">
                      No votes used today
                    </div>
                  )}
                </div>
              </div>

              {/* Comments Section */}
              <div id="comments-section">
                <CommentsSection
                  postUuid={params.uuid}
                  comments={postData?.comments || []}
                />
              </div>

              {/* Author Bio */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <Avatar className="h-16 w-16 border-2 border-gray-200">
                    <AvatarImage src="/placeholder-user.jpg" alt="Author" />
                    <AvatarFallback>AU</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      Written by{" "}
                      {postData.author?.email ||
                        postData.authorAddress ||
                        "Anonymous"}
                    </h3>
                    <p className="text-gray-600 mb-3">Author</p>
                    <Button
                      variant="outline"
                      className="text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-80 bg-white border-l border-gray-100 p-6 overflow-y-auto">
            {/* People to Follow */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> People who to follow
              </h3>
              <div className="space-y-3">
                {DUMMY_USERS.map((user, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
                      <span className="text-sm font-medium">{user.name}</span>
                    </div>
                    <Button
                      variant={user.following ? "default" : "outline"}
                      size="sm"
                      className={
                        user.following
                          ? "bg-black hover:bg-gray-800 rounded-full text-white"
                          : "rounded-full"
                      }
                    >
                      {user.following ? "Following" : "Follow"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Trends */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <span className="rotate-45">◆</span> Today's top trends
              </h3>
              <div className="space-y-4">
                {DUMMY_TRENDS.map((trend, i) => (
                  <div key={i}>
                    <h4 className="font-medium text-sm mb-1">{trend.title}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">By</span>
                      <div className="w-4 h-4 rounded-full bg-gradient-to-br from-gray-400 to-gray-600" />
                      <span className="text-xs text-gray-700">
                        {trend.author}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Topics */}
            <div>
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4" /> Topics for you
              </h3>
              <div className="flex flex-wrap gap-2">
                {DUMMY_TOPICS.map((topic, i) => (
                  <button
                    key={i}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-full text-sm font-medium"
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
