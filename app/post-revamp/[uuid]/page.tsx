"use client";

import type React from "react";
import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  MessageSquare,
  Flag,
  Share2,
  Calendar,
  Clock,
  Send,
  User,
  Loader2,
  AlertCircle,
  Maximize2,
  X,
  ArrowLeft,
  Bookmark,
  MoreHorizontal,
  MessageCircle,
} from "lucide-react";
import { PiHandsClappingThin } from "react-icons/pi";
import { IoChevronUpCircle } from "react-icons/io5";
import HomeNavbar from "@/components/ui/HomeNavbar";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useSinglePost } from "@/hooks/api/posts";
import { useUserProfile } from "@/hooks/api/profile";
import { useAccount } from "wagmi";
import { contract } from "@/constants/contract";
import {
  useWriteCurateAiVoteVote,
  useReadCurateAiPostsGetPostScore,
} from "@/hooks/wagmi/contracts";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { CommentsSection } from "@/components/comments/CommentsSection";
import { useCreateScore, useUpdateScore } from "@/hooks/api/scores";
import { useAddFlag, useRemoveFlag, useFlagStatus } from "@/hooks/api/flags";
import {
  useAddClap,
  useClapStatus,
  useClapCount,
  useMaxClapsPerUser,
} from "@/hooks/api/claps";
import { showToast } from "@/utils/showToast";
import { LeftSidebar } from "@/components/home-revamp";
import { createClapDebouncer } from "@/utils/clapDebounce";

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
  const { address: userAddress } = useAccount();
  const router = useRouter();

  // Fetch post data from API
  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useSinglePost(params.uuid);

  // Get author UUID (might be in author object or need to derive from address)
  const authorUuid = postData?.author?.uuid;

  // Fetch author profile if UUID is available
  const { data: authorProfile, isLoading: isAuthorProfileLoading } =
    useUserProfile(authorUuid || "", {
      enabled: !!authorUuid,
    });

  // Get internal_id (cid) from post data
  const cid = postData?.internal_id ?? 0;

  // Fetch user token balance
  const { balance: tokenBalance } = useCatTokenBalance();

  // Fetch post score from blockchain
  const { data: postScore } = useReadCurateAiPostsGetPostScore({
    address: contract.post as `0x${string}`,
    args: [BigInt(cid)],
    query: {
      enabled: !!postData && postData.internal_id !== undefined && cid > 0,
    },
  });

  // Voting contract interaction
  const { writeContractAsync, isPending: isScorePending } =
    useWriteCurateAiVoteVote();

  // API hooks for scoring
  const createScoreMutation = useCreateScore();
  const updateScoreMutation = useUpdateScore();

  // API hooks for flags
  const addFlagMutation = useAddFlag();
  const removeFlagMutation = useRemoveFlag();
  const { data: flagStatusData, isLoading: isFlagStatusLoading } =
    useFlagStatus(params.uuid);

  // API hooks for claps
  const addClapMutation = useAddClap();
  const { data: clapStatusData, isLoading: isClapStatusLoading } =
    useClapStatus(params.uuid);
  const { data: clapCountData, isLoading: isClapCountLoading } = useClapCount(
    params.uuid
  );
  const { data: maxClapsData } = useMaxClapsPerUser();

  // State for voting
  const [voteWeight, setVoteWeight] = useState(50); // Percentage for slider
  const [voteValue, setVoteValue] = useState<bigint | undefined>(BigInt(0));
  const [isClapping, setIsClapping] = useState(false);
  const [pendingClapCount, setPendingClapCount] = useState(0);
  const [optimisticUserClapCount, setOptimisticUserClapCount] = useState<
    number | null
  >(null);
  const [optimisticTotalClapCount, setOptimisticTotalClapCount] = useState<
    number | null
  >(null);
  const [clapAnimations, setClapAnimations] = useState<
    Array<{ id: number; timestamp: number; xOffset: number }>
  >([]);

  // Create clap debouncer callback ref
  const clapDebouncerCallbackRef = useRef<
    ((clapCount: number) => Promise<void>) | null
  >(null);

  // State for reading mode
  const [isReadingMode, setIsReadingMode] = useState(false);
  const [showScorePopover, setShowScorePopover] = useState(false);
  const scorePopoverRef = useRef<HTMLDivElement>(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        scorePopoverRef.current &&
        !scorePopoverRef.current.contains(event.target as Node)
      ) {
        setShowScorePopover(false);
      }
    };

    if (showScorePopover) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showScorePopover]);

  // Get flag status from API
  const hasFlagged = flagStatusData?.hasFlagged || false;
  const isFlagPending =
    addFlagMutation.isPending || removeFlagMutation.isPending;

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
        message: "Please connect your wallet to upvote posts",
        type: "error",
      });
      return;
    }

    if (!voteValue || isScorePending) {
      return;
    }

    if (!postData || postData.internal_id === undefined) {
      showToast({
        message: "Post data not loaded. Please try again.",
        type: "error",
      });
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
      console.log("Arguments:", [BigInt(cid), voteValue]);

      let txResult;
      let blockchainError = false;
      try {
        txResult = await writeContractAsync({
          address: contract.vote as `0x${string}`,
          args: [BigInt(cid), voteValue],
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
          message: `Successfully upvoted ${voteValue.toString()} points!`,
          type: "success",
        });
      } else {
        showToast({
          message: `Upvote recorded but blockchain transaction failed. Please try again.`,
          type: "warning",
        });
      }
    } catch (error) {
      console.error("Scoring error:", error);
      showToast({
        message: "Failed to upvote post. Please try again.",
        type: "error",
      });
    }
  };

  // Get clap status and count (use optimistic values if available)
  const baseUserClapCount = clapStatusData?.clapCount || 0;
  const baseTotalClapCount = clapCountData?.clapCount || 0;
  const userClapCount =
    optimisticUserClapCount !== null
      ? optimisticUserClapCount
      : baseUserClapCount;
  const totalClapCount =
    optimisticTotalClapCount !== null
      ? optimisticTotalClapCount
      : baseTotalClapCount;
  const maxClapsPerUser = maxClapsData?.maxClapsPerUser || 50; // Default to 50 if not loaded
  const isClapPending = addClapMutation.isPending;
  const hasReachedMax = userClapCount + pendingClapCount >= maxClapsPerUser;

  // Reset optimistic values when API data updates
  useEffect(() => {
    if (clapStatusData?.clapCount !== undefined) {
      setOptimisticUserClapCount(null);
    }
  }, [clapStatusData?.clapCount]);

  useEffect(() => {
    if (clapCountData?.clapCount !== undefined) {
      setOptimisticTotalClapCount(null);
    }
  }, [clapCountData?.clapCount]);

  // Create clap debouncer with ref-based callback (after maxClapsPerUser is defined)
  const clapDebouncerRef = useRef(
    createClapDebouncer(() => clapDebouncerCallbackRef.current!, {
      delay: 1500,
      maxClaps: maxClapsPerUser,
    })
  );

  // Update debouncer callback when dependencies change
  useEffect(() => {
    clapDebouncerCallbackRef.current = async (clapCount: number) => {
      // Check if user has reached the max clap limit
      const currentUserClaps =
        optimisticUserClapCount !== null
          ? optimisticUserClapCount
          : clapStatusData?.clapCount || 0;

      if (currentUserClaps + clapCount > maxClapsPerUser) {
        const remainingClaps = maxClapsPerUser - currentUserClaps;
        if (remainingClaps <= 0) {
          showToast({
            message: `You can only clap ${maxClapsPerUser} times on a post`,
            type: "info",
          });
          setPendingClapCount(0);
          // Rollback optimistic updates
          setOptimisticUserClapCount(null);
          setOptimisticTotalClapCount(null);
          return;
        }
        // Cap the clap count to remaining claps
        clapCount = remainingClaps;
      }

      if (isClapPending) return;

      // Store current optimistic values for rollback
      const previousOptimisticUser = optimisticUserClapCount;
      const previousOptimisticTotal = optimisticTotalClapCount;

      try {
        setIsClapping(true);
        await addClapMutation.mutateAsync({
          postUuid: params.uuid,
          clapCount: clapCount,
        });
        setPendingClapCount(0);
        // Clear optimistic values - API will update them
        setOptimisticUserClapCount(null);
        setOptimisticTotalClapCount(null);
        showToast({
          message: `${clapCount} clap${clapCount > 1 ? "s" : ""} added!`,
          type: "success",
        });
      } catch (error) {
        console.error("Failed to add clap:", error);
        // Rollback optimistic updates on error
        setOptimisticUserClapCount(previousOptimisticUser);
        setOptimisticTotalClapCount(previousOptimisticTotal);
        setPendingClapCount(0);
        showToast({
          message: "Failed to add clap. Please try again.",
          type: "error",
        });
      } finally {
        setIsClapping(false);
      }
    };
  }, [
    maxClapsPerUser,
    params.uuid,
    clapStatusData,
    isClapPending,
    addClapMutation,
    optimisticUserClapCount,
  ]);

  // Cleanup debouncer on unmount
  useEffect(() => {
    return () => {
      if (clapDebouncerRef.current) {
        clapDebouncerRef.current.flush();
      }
    };
  }, []);

  // Handle clap
  const handleClap = () => {
    // Check if user has reached the max clap limit
    if (hasReachedMax) {
      showToast({
        message: `You can only clap ${maxClapsPerUser} times on a post`,
        type: "info",
      });
      return;
    }

    if (isClapPending) return;

    // Trigger animation with random horizontal offset
    const animationId = Date.now();
    const xOffset = (Math.random() - 0.5) * 20; // Random between -10 and 10
    setClapAnimations((prev) => [
      ...prev,
      { id: animationId, timestamp: Date.now(), xOffset },
    ]);

    // Remove animation after it completes
    setTimeout(() => {
      setClapAnimations((prev) =>
        prev.filter((anim) => anim.id !== animationId)
      );
    }, 1000);

    // Optimistically update counts immediately
    setOptimisticUserClapCount((prev) => {
      const current = prev !== null ? prev : clapStatusData?.clapCount || 0;
      return current + 1;
    });
    setOptimisticTotalClapCount((prev) => {
      const current = prev !== null ? prev : clapCountData?.clapCount || 0;
      return current + 1;
    });

    // Add clap to debouncer
    clapDebouncerRef.current.addClap(1);
    setPendingClapCount((prev) => prev + 1);
  };

  // Handle flag
  const handleFlag = async () => {
    if (isFlagPending) return;

    try {
      if (hasFlagged) {
        // Remove flag
        await removeFlagMutation.mutateAsync({
          postUuid: params.uuid,
        });
        showToast({
          message: "Flag removed successfully",
          type: "success",
        });
      } else {
        // Add flag
        await addFlagMutation.mutateAsync({
          postUuid: params.uuid,
        });
        showToast({
          message: "Post flagged successfully",
          type: "success",
        });
      }
    } catch (error) {
      console.error("Flag error:", error);
      showToast({
        message: "Failed to update flag. Please try again.",
        type: "error",
      });
    }
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

        /* Increase paragraph spacing - Medium-like readability */
        .prose p,
        .wmde-markdown p,
        article p {
          margin-top: 0 !important;
          margin-bottom: 1.25rem !important;
          line-height: 1.75 !important;
          font-size: 1.0625rem !important;
          color: #292929 !important;
        }

        .prose p:first-child,
        .wmde-markdown p:first-child,
        article p:first-child {
          margin-top: 0 !important;
        }

        .prose p:last-child,
        .wmde-markdown p:last-child,
        article p:last-child {
          margin-bottom: 0 !important;
        }

        /* Proper spacing for paragraphs after headings */
        .prose h1 + p,
        .prose h2 + p,
        .prose h3 + p,
        .prose h4 + p,
        .prose h5 + p,
        .prose h6 + p,
        .wmde-markdown h1 + p,
        .wmde-markdown h2 + p,
        .wmde-markdown h3 + p,
        .wmde-markdown h4 + p,
        .wmde-markdown h5 + p,
        .wmde-markdown h6 + p,
        article h1 + p,
        article h2 + p,
        article h3 + p,
        article h4 + p,
        article h5 + p,
        article h6 + p {
          margin-top: 0.5rem !important;
          margin-bottom: 1.25rem !important;
        }

        /* Ensure consistent spacing between consecutive paragraphs */
        .prose p + p,
        .wmde-markdown p + p,
        article p + p {
          margin-top: 0 !important;
          margin-bottom: 1.25rem !important;
        }

        /* Increase image spacing - Medium-like spacing */
        .prose img,
        .wmde-markdown img,
        article img {
          display: block !important;
          margin-left: auto !important;
          margin-right: auto !important;
          margin-top: 4rem !important;
          margin-bottom: 4rem !important;
          border-radius: 0.5rem !important;
          max-width: 100% !important;
        }

        .prose img:first-child,
        .wmde-markdown img:first-child,
        article img:first-child {
          margin-top: 0 !important;
        }

        .prose img:last-child,
        .wmde-markdown img:last-child,
        article img:last-child {
          margin-bottom: 0 !important;
        }

        /* Larger headings with generous spacing - Medium-like */
        .prose h1,
        .wmde-markdown h1,
        article h1 {
          font-size: 1.5rem !important;
          font-weight: 800 !important;
          margin-top: 3.5rem !important;
          margin-bottom: 0 !important;
          line-height: 1.2 !important;
          color: #292929 !important;
          border-bottom: none !important;
          border-top: none !important;
          border: none !important;
        }

        .prose h2,
        .wmde-markdown h2,
        article h2 {
          font-size: 1.375rem !important;
          font-weight: 800 !important;
          margin-top: 3rem !important;
          margin-bottom: 0 !important;
          line-height: 1.25 !important;
          color: #292929 !important;
          border-bottom: none !important;
          border-top: none !important;
          border: none !important;
        }

        .prose h3,
        .wmde-markdown h3,
        article h3 {
          font-size: 1.25rem !important;
          font-weight: 800 !important;
          margin-top: 2.5rem !important;
          margin-bottom: 0 !important;
          line-height: 1.3 !important;
          color: #292929 !important;
          border-bottom: none !important;
          border-top: none !important;
          border: none !important;
        }

        .prose h4,
        .wmde-markdown h4,
        article h4 {
          font-size: 1.125rem !important;
          font-weight: 800 !important;
          margin-top: 2.25rem !important;
          margin-bottom: 0 !important;
          line-height: 1.35 !important;
          color: #292929 !important;
          border-bottom: none !important;
          border-top: none !important;
          border: none !important;
        }

        .prose h5,
        .wmde-markdown h5,
        article h5 {
          font-size: 1.0625rem !important;
          font-weight: 800 !important;
          margin-top: 2rem !important;
          margin-bottom: 0 !important;
          line-height: 1.4 !important;
          color: #292929 !important;
          border-bottom: none !important;
          border-top: none !important;
          border: none !important;
        }

        .prose h6,
        .wmde-markdown h6,
        article h6 {
          font-size: 1rem !important;
          font-weight: 800 !important;
          margin-top: 1.75rem !important;
          margin-bottom: 0 !important;
          line-height: 1.4 !important;
          color: #292929 !important;
          border-bottom: none !important;
          border-top: none !important;
          border: none !important;
        }

        .prose h1:first-child,
        .prose h2:first-child,
        .prose h3:first-child,
        .prose h4:first-child,
        .prose h5:first-child,
        .prose h6:first-child,
        .wmde-markdown h1:first-child,
        .wmde-markdown h2:first-child,
        .wmde-markdown h3:first-child,
        .wmde-markdown h4:first-child,
        .wmde-markdown h5:first-child,
        .wmde-markdown h6:first-child,
        article h1:first-child,
        article h2:first-child,
        article h3:first-child,
        article h4:first-child,
        article h5:first-child,
        article h6:first-child {
          margin-top: 0 !important;
        }

        /* Better list spacing */
        .prose ul,
        .prose ol,
        .wmde-markdown ul,
        .wmde-markdown ol,
        article ul,
        article ol {
          margin-top: 2.5rem !important;
          margin-bottom: 2.5rem !important;
          padding-left: 1.5rem !important;
          list-style-type: disc !important;
        }

        .prose ol,
        .wmde-markdown ol,
        article ol {
          list-style-type: decimal !important;
        }

        .prose li,
        .wmde-markdown li,
        article li {
          margin-top: 0.75rem !important;
          margin-bottom: 0.75rem !important;
          line-height: 1.9 !important;
          display: list-item !important;
          list-style-position: outside !important;
        }

        /* Ensure list markers are visible */
        .prose ul li::marker,
        .wmde-markdown ul li::marker,
        article ul li::marker {
          color: #292929 !important;
          font-size: 1.2em !important;
        }

        .prose ol li::marker,
        .wmde-markdown ol li::marker,
        article ol li::marker {
          color: #292929 !important;
          font-weight: 600 !important;
        }

        /* Better code block spacing */
        .prose pre,
        .wmde-markdown pre,
        article pre {
          margin-top: 3rem !important;
          margin-bottom: 3rem !important;
          border-radius: 0.5rem !important;
        }

        /* Better blockquote spacing */
        .prose blockquote,
        .wmde-markdown blockquote,
        article blockquote {
          margin-top: 3rem !important;
          margin-bottom: 3rem !important;
          padding-left: 1.5rem !important;
          border-left: 3px solid #e5e7eb !important;
          font-style: italic !important;
        }

        /* Remove horizontal lines after headings */
        .prose hr,
        .wmde-markdown hr,
        article hr {
          display: none !important;
        }

        /* Remove any borders or lines that might appear after headings */
        .prose h1 + hr,
        .prose h2 + hr,
        .prose h3 + hr,
        .prose h4 + hr,
        .prose h5 + hr,
        .prose h6 + hr,
        .wmde-markdown h1 + hr,
        .wmde-markdown h2 + hr,
        .wmde-markdown h3 + hr,
        .wmde-markdown h4 + hr,
        .wmde-markdown h5 + hr,
        .wmde-markdown h6 + hr,
        article h1 + hr,
        article h2 + hr,
        article h3 + hr,
        article h4 + hr,
        article h5 + hr,
        article h6 + hr {
          display: none !important;
        }

        /* Remove any pseudo-elements that might create lines */
        .prose h1::after,
        .prose h1::before,
        .prose h2::after,
        .prose h2::before,
        .prose h3::after,
        .prose h3::before,
        .prose h4::after,
        .prose h4::before,
        .prose h5::after,
        .prose h5::before,
        .prose h6::after,
        .prose h6::before,
        .wmde-markdown h1::after,
        .wmde-markdown h1::before,
        .wmde-markdown h2::after,
        .wmde-markdown h2::before,
        .wmde-markdown h3::after,
        .wmde-markdown h3::before,
        .wmde-markdown h4::after,
        .wmde-markdown h4::before,
        .wmde-markdown h5::after,
        .wmde-markdown h5::before,
        .wmde-markdown h6::after,
        .wmde-markdown h6::before,
        article h1::after,
        article h1::before,
        article h2::after,
        article h2::before,
        article h3::after,
        article h3::before,
        article h4::after,
        article h4::before,
        article h5::after,
        article h5::before,
        article h6::after,
        article h6::before {
          display: none !important;
          content: none !important;
        }

        /* Remove any box-shadow or outline that might appear as lines */
        .prose h1,
        .prose h2,
        .prose h3,
        .prose h4,
        .prose h5,
        .prose h6,
        .wmde-markdown h1,
        .wmde-markdown h2,
        .wmde-markdown h3,
        .wmde-markdown h4,
        .wmde-markdown h5,
        .wmde-markdown h6,
        article h1,
        article h2,
        article h3,
        article h4,
        article h5,
        article h6 {
          box-shadow: none !important;
          outline: none !important;
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

        /* Smaller slider in upvote popover */
        .upvote-popover [data-radix-slider-track] {
          height: 2px !important;
        }
        .upvote-popover [data-radix-slider-thumb] {
          height: 8px !important;
          width: 8px !important;
        }

        /* Hide scrollbar everywhere */
        .scrollbar-hide,
        .overflow-y-auto,
        .overflow-auto,
        .overflow-x-auto {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .scrollbar-hide::-webkit-scrollbar,
        .overflow-y-auto::-webkit-scrollbar,
        .overflow-auto::-webkit-scrollbar,
        .overflow-x-auto::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>

      {/* Top Navbar */}
      <HomeNavbar />

      {/* Floating Fullscreen Button - Hidden on mobile and tablet */}
      <motion.button
        onClick={() => setIsReadingMode(!isReadingMode)}
        className="hidden lg:flex fixed bottom-8 right-8 z-50 p-2.5 bg-white/80 hover:bg-white border border-gray-200 text-gray-600 hover:text-gray-800 rounded-full shadow-sm transition-all duration-200 hover:shadow-md backdrop-blur-sm"
        aria-label={isReadingMode ? "Exit reading mode" : "Enter reading mode"}
        animate={
          isReadingMode
            ? {}
            : {
                scale: [1, 1.1, 1],
              }
        }
        transition={{
          scale: {
            duration: 1.5,
            repeat: Infinity,
            repeatDelay: 2,
            ease: "easeInOut",
          },
        }}
      >
        {isReadingMode ? (
          <X className="w-4 h-4" />
        ) : (
          <Maximize2 className="w-4 h-4" />
        )}
      </motion.button>

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Content Area */}
        <motion.div
          className="flex flex-1 overflow-hidden bg-white"
          initial={false}
          animate={{
            justifyContent: isReadingMode ? "center" : "flex-start",
          }}
          transition={{
            duration: 0.5,
            delay: isReadingMode ? 0.3 : 0,
            ease: [0.4, 0, 0.2, 1],
          }}
        >
          {/* Left Sidebar - Hidden on mobile */}
          <motion.div
            initial={false}
            animate={{
              width: isReadingMode ? 0 : 320,
              opacity: isReadingMode ? 0 : 1,
            }}
            transition={{
              opacity: {
                duration: 0.3,
                delay: isReadingMode ? 0 : 0.3,
                ease: [0.4, 0, 0.2, 1],
              },
              width: {
                duration: 0.5,
                delay: isReadingMode ? 0.3 : 0,
                ease: [0.4, 0, 0.2, 1],
              },
            }}
            className="hidden lg:block overflow-hidden"
          >
            <LeftSidebar />
          </motion.div>

          {/* Main Content */}
          <motion.div
            initial={false}
            animate={{
              flex: isReadingMode ? "0 0 80%" : "1 1 0",
            }}
            transition={{
              duration: 0.5,
              delay: isReadingMode ? 0.3 : 0,
              ease: [0.4, 0, 0.2, 1],
            }}
            className={
              isReadingMode
                ? "overflow-y-auto px-4 lg:px-24 scrollbar-hide w-full lg:w-auto"
                : "overflow-y-auto px-4 lg:px-24 w-full lg:w-auto"
            }
          >
            <div className="p-1">
              <div className="w-full lg:w-[80%] lg:mx-auto mt-8">
                {/* Article Header */}
                <div className="bg-white border-b border-gray-200 py-4 px-3 mb-0">
                  {/* Author Info */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Avatar className="h-7 w-7 border border-gray-200">
                        <AvatarImage
                          src={
                            authorProfile?.profile?.profilePic
                              ? `https://gateway.pinata.cloud/ipfs/${authorProfile.profile.profilePic}`
                              : "/placeholder-user.jpg"
                          }
                          alt={
                            authorProfile?.profile?.username ||
                            postData.author?.email ||
                            "Author"
                          }
                        />
                        <AvatarFallback>
                          {authorProfile?.profile?.username
                            ? authorProfile.profile.username
                                .substring(0, 2)
                                .toUpperCase()
                            : postData.author?.email
                            ? postData.author.email
                                .substring(0, 2)
                                .toUpperCase()
                            : "AU"}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-xs font-medium text-gray-900">
                        {authorProfile?.profile?.username ||
                          postData.author?.email ||
                          postData.authorAddress?.slice(0, 6) + "..." ||
                          "Anonymous"}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2">
                      {/* Back Button */}
                      <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-gray-100 rounded transition-colors"
                        aria-label="Go back"
                      >
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                  </div>

                  {/* Title */}
                  <motion.h1
                    initial={false}
                    animate={{
                      fontSize: isReadingMode ? "2.5rem" : "2rem",
                    }}
                    transition={{
                      duration: 0.5,
                      delay: isReadingMode ? 0.3 : 0,
                      ease: [0.4, 0, 0.2, 1],
                    }}
                    className="font-bold text-gray-900 mb-6 text-3xl"
                  >
                    {postData.title}
                  </motion.h1>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {postData.aiRating?.secondaryTopics?.map((topic) => (
                      <span
                        key={topic}
                        className="text-xs text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                      >
                        #{topic}
                      </span>
                    )) ||
                      ["blockchain", "web3", "development"].map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-600 hover:text-gray-800 cursor-pointer transition-colors"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>

                  {/* Engagement Metrics */}
                  <div className="flex items-center gap-4 text-xs text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <IoChevronUpCircle className="w-3.5 h-3.5" />
                      <span>{postScore ? postScore.toString() : "0"}</span>
                    </div>
                    <span className="text-gray-500">5 min read</span>
                  </div>
                </div>

                {/* Article Content */}
                <div className="bg-white border-b border-gray-200 py-4 px-3">
                  <article
                    className={`prose prose-gray max-w-none ${
                      isReadingMode ? "prose-reading-mode" : ""
                    }`}
                  >
                    <MarkdownPreview source={postData.content || ""} />
                  </article>
                </div>

                {/* Interaction Bar */}
                <div className="bg-white border-b border-gray-100 py-6 px-3">
                  {/* Main Actions Row */}
                  <div className="flex items-center justify-between">
                    {/* Left Group: Clap and Comment */}
                    <div className="flex items-center gap-6">
                      {/* Clap - Prominent */}
                      <div className="relative">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          animate={isClapping ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                          onClick={handleClap}
                          disabled={isClapPending || hasReachedMax}
                          className={`flex items-center gap-2 transition-colors ${
                            hasReachedMax
                              ? "text-gray-400 cursor-not-allowed"
                              : userClapCount > 0
                              ? "text-gray-900"
                              : "text-gray-600 hover:text-gray-800"
                          }`}
                          title={
                            hasReachedMax
                              ? `You can only clap ${maxClapsPerUser} times on a post`
                              : `Clap (${userClapCount}/${maxClapsPerUser})`
                          }
                        >
                          {isClapPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <PiHandsClappingThin
                              className={`h-5 w-5 ${
                                hasReachedMax
                                  ? "text-gray-400"
                                  : userClapCount > 0
                                  ? "text-gray-900"
                                  : "text-gray-600"
                              }`}
                            />
                          )}
                          <span className="text-base font-medium">
                            {isClapCountLoading ? "..." : totalClapCount}
                          </span>
                        </motion.button>

                        {/* +1 Animation */}
                        {clapAnimations.map((anim) => (
                          <motion.div
                            key={anim.id}
                            initial={{
                              opacity: 0,
                              scale: 0.3,
                              y: 0,
                              x: 0,
                            }}
                            animate={{
                              opacity: [0, 1, 1, 0.8, 0],
                              scale: [0.3, 1.3, 1.1, 1, 0.9],
                              y: -35,
                              x: anim.xOffset,
                            }}
                            exit={{
                              opacity: 0,
                              scale: 0.9,
                            }}
                            transition={{
                              duration: 0.7,
                              ease: [0.34, 1.56, 0.64, 1], // Bouncy ease
                              times: [0, 0.2, 0.4, 0.8, 1],
                            }}
                            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-10 whitespace-nowrap"
                            style={{
                              transformOrigin: "center bottom",
                            }}
                          >
                            <span className="text-base font-bold text-gray-800 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full shadow-md border border-gray-200/80">
                              +1
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Comment */}
                      <button
                        onClick={() => {
                          document
                            .getElementById("comments-section")
                            ?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <MessageCircle className="h-5 w-5" />
                        <span className="text-base font-medium">
                          {postData?.comments?.length || 0}
                        </span>
                      </button>
                    </div>

                    {/* Right Group: Upvote, Bookmark, Share, More */}
                    <div className="flex items-center gap-4">
                      {/* Upvote - Icon only with popover */}
                      <div className="relative" ref={scorePopoverRef}>
                        <button
                          onClick={() => setShowScorePopover(!showScorePopover)}
                          className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
                        >
                          <IoChevronUpCircle className="h-5 w-5" />
                        </button>

                        {/* Upvote Popover */}
                        {showScorePopover && (
                          <div className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3 w-64 z-50 upvote-popover">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-700">
                                  Upvote
                                </span>
                                <button
                                  onClick={() => setShowScorePopover(false)}
                                  className="text-gray-400 hover:text-gray-600"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-xs text-gray-600 leading-relaxed">
                                Upvoting is action tied to blockchain and can't
                                be reverted, this will use your daily upvoting
                                limit.
                              </p>
                              <div className="flex items-center gap-2">
                                <div className="flex-1">
                                  <Slider
                                    value={[voteWeight]}
                                    min={0}
                                    max={100}
                                    step={1}
                                    onValueChange={(value) =>
                                      setVoteWeight(value[0])
                                    }
                                    className="w-full"
                                  />
                                </div>
                                <span className="text-xs text-gray-500 w-8 text-right">
                                  {voteWeight}%
                                </span>
                              </div>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  if (voteWeight > 0) {
                                    handleVote(e);
                                    setShowScorePopover(false);
                                  }
                                }}
                                disabled={isScorePending || voteWeight === 0}
                                className="w-full bg-gray-800 hover:bg-gray-900 text-white"
                              >
                                {isScorePending ? (
                                  <Loader2 className="h-4 w-4 mr-1.5 animate-spin" />
                                ) : (
                                  <IoChevronUpCircle className="h-4 w-4 mr-1.5" />
                                )}
                                <span>Submit Upvote</span>
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Bookmark */}
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        <Bookmark className="h-5 w-5" />
                      </button>

                      {/* Share */}
                      <button
                        onClick={() =>
                          navigator.clipboard.writeText(window.location.href)
                        }
                        className="text-gray-600 hover:text-gray-800 transition-colors"
                      >
                        <Share2 className="h-5 w-5" />
                      </button>

                      {/* More Options */}
                      <button className="text-gray-600 hover:text-gray-800 transition-colors">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div
                  id="comments-section"
                  className="bg-white border-b border-gray-200 py-4 px-3"
                >
                  <CommentsSection
                    postUuid={params.uuid}
                    comments={postData?.comments || []}
                  />
                </div>

                {/* Author Bio */}
                <div className="bg-white border-b border-gray-200 py-4 px-3">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-gray-200">
                      <AvatarImage
                        src={
                          authorProfile?.profile?.profilePic
                            ? `https://gateway.pinata.cloud/ipfs/${authorProfile.profile.profilePic}`
                            : "/placeholder-user.jpg"
                        }
                        alt={
                          authorProfile?.profile?.username ||
                          postData.author?.email ||
                          "Author"
                        }
                      />
                      <AvatarFallback>
                        {authorProfile?.profile?.username
                          ? authorProfile.profile.username
                              .substring(0, 2)
                              .toUpperCase()
                          : postData.author?.email
                          ? postData.author.email.substring(0, 2).toUpperCase()
                          : "AU"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {authorProfile?.profile?.username ||
                          authorProfile?.profile?.fullName ||
                          postData.author?.email ||
                          postData.authorAddress?.slice(0, 6) + "..." ||
                          "Anonymous"}
                      </p>
                      <p className="text-xs text-gray-500">
                        {authorProfile?.profile?.bio || "Author"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-gray-600 border-gray-300 hover:bg-gray-50"
                    >
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
