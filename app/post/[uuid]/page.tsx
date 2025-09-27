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
} from "lucide-react";
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb] pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <p className="text-gray-600">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (postError || !postData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb] pt-16 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <AlertCircle className="w-16 h-16 mb-4 text-red-500" />
          <p className="text-xl font-semibold text-gray-900">
            Blog post not found
          </p>
          <p className="text-gray-600 mt-2">
            The post you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb] pt-16">
      <div className="max-w-4xl mx-auto px-4 py-8">
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

            <Separator orientation="vertical" className="h-8 hidden sm:block" />

            <div className="flex items-center text-gray-500 text-sm">
              <Calendar className="h-4 w-4 mr-1" />
              <span>
                {postData.aiRating?.createdAt
                  ? formatDistanceToNow(new Date(postData.aiRating.createdAt), {
                      addSuffix: true,
                    })
                  : "Recently"}
              </span>
            </div>

            <div className="flex items-center text-gray-500 text-sm">
              <Clock className="h-4 w-4 mr-1" />
              <span>5 min read</span>
            </div>

            <div className="flex items-center text-gray-500 text-sm">
              <ThumbsUp className="h-4 w-4 mr-1 text-blue-500" />
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
                className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
              >
                #{topic}
              </Badge>
            )) ||
              ["blockchain", "web3", "development"].map((tag) => (
                <Badge
                  key={tag}
                  variant="outline"
                  className="bg-blue-50 text-blue-600 border-blue-100 hover:bg-blue-100"
                >
                  #{tag}
                </Badge>
              ))}
          </div>
        </div>

        {/* Article Content */}
        <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-8">
          <article className="prose prose-blue max-w-none">
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
                      ? "bg-blue-600 text-white"
                      : "text-blue-600 border-blue-200"
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
                    className="w-full"
                  />
                  <span className="text-xs text-gray-500 w-8">
                    {voteWeight}%
                  </span>
                </div>
              </div>

              {/* Post Score Display */}
              <div className="flex items-center gap-1.5 text-gray-600">
                <ThumbsUp className="h-5 w-5 text-blue-500" />
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
                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
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
                className="flex items-center gap-1.5 text-gray-600 hover:text-blue-600"
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
                  className={`h-4 w-4 ${hasFlagged ? "fill-red-100" : ""}`}
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
                    : dailyVoteData && dailyVoteData.totalVotePercentage >= 500
                    ? "bg-red-500"
                    : dailyVoteData && dailyVoteData.totalVotePercentage >= 400
                    ? "bg-yellow-500"
                    : "bg-blue-500"
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
            <Avatar className="h-16 w-16 border-2 border-blue-100">
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
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                Follow
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
