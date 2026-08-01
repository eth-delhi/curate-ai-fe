"use client";

import type React from "react";
import { use, useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  Clock,
  Send,
  User,
  Loader2,
  AlertCircle,
  X,
  ArrowLeft,
  MoreHorizontal,
} from "lucide-react";
import {
  ClapIcon,
  CommentIcon,
  BookmarkIcon,
  UpvoteIcon,
} from "@/components/icons";
import HomeNavbar from "@/components/ui/HomeNavbar";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSinglePost } from "@/hooks/api/posts";
import { useUserProfile } from "@/hooks/api/profile";
import { useAccount } from "wagmi";
import { useContractAddresses } from "@/context/contractAddresses.provider";
import {
  useWriteCurateAiVoteVote,
  useReadCurateAiPostsGetPostScore,
  useReadCurateAiRoleManagerCuratorRole,
  useReadCurateAiRoleManagerHasRole,
  useReadCurateAiVoteHasVoted,
} from "@/hooks/wagmi/contracts";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { RPC_POLL_INTERVAL_MS } from "@/constants/chain";
import { CommentsSection } from "@/components/comments/CommentsSection";
import {
  useCreateScore,
  useUpdateScore,
  useVerifyScore,
} from "@/hooks/api/scores";
import { useAddFlag, useRemoveFlag, useFlagStatus } from "@/hooks/api/flags";
import {
  useAddClap,
  useClapStatus,
  useClapCount,
  useMaxClapsPerUser,
} from "@/hooks/api/claps";
import { showToast } from "@/utils/showToast";
import { useAuth } from "@/hooks/useAuth";
import { createClapDebouncer } from "@/utils/clapDebounce";

const MarkdownPreview = dynamic(
  () => import("@uiw/react-markdown-preview").then((mod) => mod.default),
  { ssr: false }
);

// Renders <img> tags from post content with the fast S3 URL as the primary
// src, falling back to the pinned IPFS gateway URL (data-ipfs-fallback,
// injected by the backend at publish time) exactly once if S3 fails to load.
function PostImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
  const fallback = (props as Record<string, string | undefined>)[
    "data-ipfs-fallback"
  ];
  const triedFallback = useRef(false);
  const [src, setSrc] = useState(props.src);

  const handleError = () => {
    if (!triedFallback.current && fallback) {
      triedFallback.current = true;
      setSrc(fallback);
    }
  };

  // eslint-disable-next-line @next/next/no-img-element
  return <img {...props} src={src} onError={handleError} />;
}

interface BlogPostViewProps {
  params: Promise<{
    uuid: string;
  }>;
}

export default function BlogPostView({ params }: BlogPostViewProps) {
  const { uuid } = use(params);
  const { address: userAddress } = useAccount();
  const { contracts } = useContractAddresses();
  const router = useRouter();
  const { isAuthenticated } = useAuth();

  // Fetch post data from API
  const {
    data: postData,
    isLoading: isPostLoading,
    error: postError,
  } = useSinglePost(uuid);

  // Set page title to post title
  useEffect(() => {
    if (postData?.title) {
      document.title = postData.title;
    }
  }, [postData?.title]);

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
  const { balance: tokenBalance, isLoading: isTokenBalanceLoading } =
    useCatTokenBalance();

  // Vote count shown here comes straight from the chain (post.sol's
  // totalScore), not the backend's score rows — this page needs the exact,
  // currently-enforced number. Polls so it stays live, and is refetched
  // explicitly right after a vote confirms below.
  const { data: postScore, refetch: refetchPostScore } =
    useReadCurateAiPostsGetPostScore({
      address: contracts?.post as `0x${string}`,
      args: [BigInt(cid)],
      query: {
        enabled:
          !!contracts &&
          !!postData &&
          postData.internal_id !== undefined &&
          cid > 0,
        refetchInterval: RPC_POLL_INTERVAL_MS,
        staleTime: RPC_POLL_INTERVAL_MS,
      },
    });

  // Voting contract interaction
  const { writeContractAsync, isPending: isScorePending } =
    useWriteCurateAiVoteVote();

  // vote.sol's vote() is gated onlyRole(CURATOR_ROLE) — check this up front
  // so non-curators get a clear explanation instead of a silent on-chain
  // revert with no useful feedback.
  const { data: curatorRole } = useReadCurateAiRoleManagerCuratorRole({
    address: contracts?.role as `0x${string}`,
    query: { enabled: !!contracts, staleTime: Infinity },
  });
  const { data: isCurator, isLoading: isCuratorCheckLoading } =
    useReadCurateAiRoleManagerHasRole({
      address: contracts?.role as `0x${string}`,
      args:
        curatorRole !== undefined && userAddress
          ? [curatorRole, userAddress]
          : undefined,
      query: {
        enabled: !!contracts && curatorRole !== undefined && !!userAddress,
        refetchInterval: RPC_POLL_INTERVAL_MS,
        staleTime: RPC_POLL_INTERVAL_MS,
      },
    });

  // vote.sol only allows one vote per (account, post) — hasVoted[msg.sender][postId].
  // Read straight from the contract so the button state can't drift from
  // what the chain will actually enforce.
  const { data: hasVotedOnPost, refetch: refetchHasVoted } =
    useReadCurateAiVoteHasVoted({
      address: contracts?.vote as `0x${string}`,
      args:
        userAddress && postData?.internal_id !== undefined
          ? [userAddress, BigInt(postData.internal_id)]
          : undefined,
      query: {
        enabled:
          !!contracts && !!userAddress && postData?.internal_id !== undefined,
        refetchInterval: RPC_POLL_INTERVAL_MS,
        staleTime: RPC_POLL_INTERVAL_MS,
      },
    });

  // API hooks for scoring
  const createScoreMutation = useCreateScore();
  const updateScoreMutation = useUpdateScore();
  const verifyScoreMutation = useVerifyScore();

  // API hooks for flags
  const addFlagMutation = useAddFlag();
  const removeFlagMutation = useRemoveFlag();
  const { data: flagStatusData, isLoading: isFlagStatusLoading } =
    useFlagStatus(uuid);

  // API hooks for claps
  const addClapMutation = useAddClap();
  const { data: clapStatusData, isLoading: isClapStatusLoading } =
    useClapStatus(uuid);
  const { data: clapCountData, isLoading: isClapCountLoading } =
    useClapCount(uuid);
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

  // Posts that never made it on-chain can't be voted on (no internal_id to
  // reference in the vote contract).
  const isPostOnChainFailed = postData?.status === "BLOCKCHAIN_FAILED";

  // Handle voting with API integration
  const handleVote = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isPostOnChainFailed) {
      showToast({
        message:
          "This post has failed to update to the blockchain. It will be added in some time.",
        type: "error",
      });
      return;
    }

    if (!userAddress) {
      showToast({
        message: "Please connect your wallet to upvote posts",
        type: "error",
      });
      return;
    }

    if (isCurator === false) {
      showToast({
        message: "Only curators can upvote posts",
        type: "error",
      });
      return;
    }

    if (hasVotedOnPost === true) {
      showToast({
        message: "You've already voted on this post.",
        type: "error",
      });
      return;
    }

    if (isScorePending) {
      return;
    }

    if (isTokenBalanceLoading) {
      showToast({
        message: "Your token balance is still loading. Please try again in a moment.",
        type: "error",
      });
      return;
    }

    if (!voteValue) {
      showToast({
        message: "You need CAT tokens to upvote.",
        type: "error",
      });
      return;
    }

    if (!postData || postData.internal_id === undefined) {
      showToast({
        message: "Post data not loaded. Please try again.",
        type: "error",
      });
      return;
    }


    if (!contracts) {
      showToast({
        message: "Contract addresses not loaded yet. Please wait...",
        type: "error",
      });
      return;
    }

    try {

      const scoreData = await createScoreMutation.mutateAsync({
        postUuid: uuid,
        userWalletAddress: userAddress,
        quantity: Number(voteValue),
        votePercentage: voteWeight,
      });

      let txResult;
      let blockchainError = false;
      let blockchainErrorReason: string | undefined;
      try {
        txResult = await writeContractAsync({
          address: contracts.vote as `0x${string}`,
          args: [BigInt(cid), voteValue],
        });
      } catch (txError: any) {
        console.error("Blockchain transaction failed:", txError);
        blockchainError = true;
        txResult = null;
        // viem surfaces revert reasons (e.g. the AccessControl "missing
        // role" error from vote.sol's onlyRole(CURATOR_ROLE)) via
        // shortMessage; fall back to the raw message if that's not present.
        blockchainErrorReason = txError?.shortMessage || txError?.message;
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

      try {
        // The backend only lets clients set BLOCKCHAIN_INITIATED/BLOCKCHAIN_FAILED;
        // VERIFIED is reached via the verify endpoint after an on-chain check.
        await updateScoreMutation.mutateAsync({
          scoreUuid: scoreData.uuid,
          txHash,
          status: txHash ? "BLOCKCHAIN_INITIATED" : "BLOCKCHAIN_FAILED",
        });
        console.log("Update score API call completed");
      } catch (updateError) {
        console.error("Update score failed:", updateError);
        throw updateError;
      }

      // Step 4: Verify the transaction on-chain so the score reaches
      // verified state. Non-fatal: the vote is already recorded.
      if (txHash) {
        try {
          await verifyScoreMutation.mutateAsync(scoreData.uuid);
          console.log("Score verified on-chain");
        } catch (verifyError) {
          console.error("Score verification failed:", verifyError);
        }
      }

      // Refetch the chain's own vote-count and hasVoted state right away,
      // whether the write succeeded or reverted, so the UI (post score,
      // "already voted" button state) never drifts from what's on-chain.
      refetchPostScore();
      refetchHasVoted();

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
          message: blockchainErrorReason
            ? `Upvote failed: ${blockchainErrorReason}`
            : "Upvote recorded but the blockchain transaction failed. Please try again.",
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
          postUuid: uuid,
          clapCount: clapCount,
        });
        setPendingClapCount(0);
        // Clear optimistic values - API will update them. The clap count
        // already animated up on click, so no toast needed here.
        setOptimisticUserClapCount(null);
        setOptimisticTotalClapCount(null);
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
    uuid,
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
    if (!isAuthenticated) {
      showToast({
        message: "Sign in to clap on posts",
        type: "info",
      });
      return;
    }

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
        // Remove flag — icon state flips immediately once the query
        // invalidation refetches hasFlagged, no toast needed.
        await removeFlagMutation.mutateAsync({
          postUuid: uuid,
        });
      } else {
        // Add flag
        await addFlagMutation.mutateAsync({
          postUuid: uuid,
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
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">Loading post...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (postError || !postData) {
    return (
      <div className="flex h-screen bg-background items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 mb-4 text-destructive mx-auto" />
          <p className="text-xl font-semibold text-foreground mb-2">
            Blog post not found
          </p>
          <p className="text-muted-foreground">
            The post you're looking for doesn't exist or has been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="post-page flex h-screen flex-col bg-background text-foreground">
      <style jsx global>{`
        .post-page {
          font-family: var(--font-sans), system-ui, sans-serif;
        }

        .prose {
          --tw-prose-headings: #1a1a1a;
          --tw-prose-body: #1a1a1a;
          --tw-prose-links: #072f5f;
          --tw-prose-bold: #1a1a1a;
          --tw-prose-counters: #6b6b6b;
          --tw-prose-bullets: #e6e5e0;
          --tw-prose-hr: #e6e5e0;
          --tw-prose-quotes: #1a1a1a;
          --tw-prose-quote-borders: #e6e5e0;
          --tw-prose-captions: #6b6b6b;
          --tw-prose-code: #1a1a1a;
          --tw-prose-pre-code: #1a1a1a;
          --tw-prose-pre-bg: #fafaf8;
          --tw-prose-th-borders: #e6e5e0;
          --tw-prose-td-borders: #e6e5e0;
        }

        .wmde-markdown,
        .wmde-markdown-color,
        .wmde-markdown-var {
          background: transparent !important;
          color: #1a1a1a !important;
        }

        /* Increase paragraph spacing - Medium-like readability */
        .prose p,
        .wmde-markdown p,
        article p {
          margin-top: 0 !important;
          margin-bottom: 1.3rem !important;
          line-height: 1.8 !important;
          font-size: 1.125rem !important;
          color: #1a1a1a !important;
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
          color: #1a1a1a !important;
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
          color: #1a1a1a !important;
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
          color: #1a1a1a !important;
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
          color: #1a1a1a !important;
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
          color: #1a1a1a !important;
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
          color: #1a1a1a !important;
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
          color: #1a1a1a !important;
          font-size: 1.2em !important;
        }

        .prose ol li::marker,
        .wmde-markdown ol li::marker,
        article ol li::marker {
          color: #1a1a1a !important;
          font-weight: 600 !important;
        }

        /* Better code block spacing */
        .prose pre,
        .wmde-markdown pre,
        article pre {
          margin-top: 3rem !important;
          margin-bottom: 3rem !important;
          border-radius: 0.5rem !important;
          background: #fafaf8 !important;
          border: 1px solid #e6e5e0 !important;
          color: #1a1a1a !important;
          padding: 1rem 1.125rem !important;
          overflow-x: auto !important;
        }

        .prose code,
        .wmde-markdown code,
        article code {
          background: #e6e5e0 !important;
          color: #1a1a1a !important;
          border-radius: 0.3rem !important;
          padding: 0.1rem 0.35rem !important;
          font-size: 0.9em !important;
        }

        .prose pre code,
        .wmde-markdown pre code,
        article pre code {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border-radius: 0 !important;
        }

        /* Better blockquote spacing */
        .prose blockquote,
        .wmde-markdown blockquote,
        article blockquote {
          margin-top: 3rem !important;
          margin-bottom: 3rem !important;
          padding-left: 1.5rem !important;
          border-left: 3px solid #e6e5e0 !important;
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
          background-color: #e6e5e0 !important;
        }
        [data-radix-slider-range] {
          background-color: #1a1a1a !important;
        }
        [data-radix-slider-thumb] {
          background-color: #1a1a1a !important;
          border-color: #1a1a1a !important;
        }
        [data-radix-slider-thumb]:hover {
          background-color: #072f5f !important;
          border-color: #072f5f !important;
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
      <HomeNavbar maxWidth={1128} />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden pt-[60px]">
        {/* Content Area — always centered, no left sidebar */}
        <div className="flex flex-1 justify-center overflow-hidden bg-background">
          {/* Main Content */}
          <div
            className="scrollbar-hide w-full overflow-y-auto px-4 lg:px-12"
            style={{ flex: "0 0 80%" }}
          >
            <div className="py-2">
              <div className="mx-auto mt-8 w-full max-w-[860px]">
                {/* Article Header */}
                <div className="mb-0 border-b border-border bg-background px-3 py-5">
                  {/* Header actions */}
                  <div className="mb-2 flex justify-end">
                    <button
                      onClick={() => router.back()}
                      className="rounded p-2 transition-colors hover:bg-muted"
                      aria-label="Go back"
                    >
                      <ArrowLeft className="h-5 w-5 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Title */}
                  <h1 className="mb-6 font-serif text-[40px] font-bold leading-[1.15] tracking-tight text-foreground">
                    {postData.title}
                  </h1>

                  {/* Tags */}
                  {postData.tags && postData.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                      {postData.tags.map((tag) => (
                        <span
                          key={tag}
                          className="cursor-pointer text-[13px] text-muted-foreground transition-colors hover:text-foreground"
                        >
                          {tag.startsWith("#") ? tag : `#${tag}`}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Engagement Metrics */}
                  <div className="mb-4 flex items-center gap-4 text-[13px] text-muted-foreground">
                    {authorUuid ? (
                      <Link
                        href={`/profile/${authorUuid}`}
                        className="font-medium text-foreground hover:underline"
                      >
                        {authorProfile?.profile?.fullName ||
                          authorProfile?.profile?.username ||
                          postData.author?.email?.split("@")[0] ||
                          "Anonymous"}
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">
                        {authorProfile?.profile?.fullName ||
                          authorProfile?.profile?.username ||
                          postData.author?.email?.split("@")[0] ||
                          "Anonymous"}
                      </span>
                    )}
                    <span>·</span>
                    <span className="text-muted-foreground">
                      {`${postData?.xMinRead ?? 0} min read`}
                    </span>
                    <span>·</span>
                    <div className="flex items-center gap-1">
                      <UpvoteIcon className="h-3.5 w-3.5" />
                      <span>{postScore ? postScore.toString() : "0"}</span>
                    </div>
                  </div>

                  {typeof postData.aiRating?.rating === "number" && (
                    <div
                      className="mb-4 h-1 w-16 rounded-full bg-muted overflow-hidden"
                      title={`AI rating: ${postData.aiRating.rating}/100`}
                    >
                      <div
                        className="h-full rounded-full bg-primary/60"
                        style={{
                          width: `${Math.min(
                            100,
                            Math.max(0, postData.aiRating.rating)
                          )}%`,
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Article Content */}
                <div className="border-b border-border bg-background px-3 py-5">
                  <article className="prose max-w-none">
                    <MarkdownPreview
                      source={postData.content || ""}
                      components={{ img: PostImage }}
                    />
                  </article>
                </div>

                {/* Interaction Bar */}
                <div className="border-b border-border bg-background px-3 py-5">
                  <div className="flex items-center justify-between gap-4">
                    {/* Left Group: Clap, Comment, Upvote */}
                    <div className="flex items-center gap-6">
                      <div className="relative">
                        <motion.button
                          whileTap={{ scale: 0.95 }}
                          animate={isClapping ? { scale: [1, 1.2, 1] } : {}}
                          transition={{ duration: 0.3 }}
                          onClick={handleClap}
                          disabled={isClapPending || (isAuthenticated && hasReachedMax)}
                          className={`flex items-center gap-1.5 text-[14px] transition-colors ${
                            !isAuthenticated || hasReachedMax
                              ? "cursor-not-allowed text-muted-foreground/50"
                              : userClapCount > 0
                              ? "text-foreground"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                          title={
                            !isAuthenticated
                              ? "Sign in to clap on posts"
                              : hasReachedMax
                              ? `You can only clap ${maxClapsPerUser} times on a post`
                              : `Clap (${userClapCount}/${maxClapsPerUser})`
                          }
                        >
                          {isClapPending ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <ClapIcon
                              className={`h-5 w-5 ${
                                !isAuthenticated || hasReachedMax
                                  ? "text-muted-foreground/50"
                                  : userClapCount > 0
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            />
                          )}
                          <span className="text-[14px] font-medium">
                            {isClapCountLoading ? "..." : totalClapCount}
                          </span>
                        </motion.button>

                        {clapAnimations.map((anim) => (
                          <motion.div
                            key={anim.id}
                            initial={{ opacity: 0, scale: 0.3, y: 0, x: 0 }}
                            animate={{
                              opacity: [0, 1, 1, 0.8, 0],
                              scale: [0.3, 1.3, 1.1, 1, 0.9],
                              y: -35,
                              x: anim.xOffset,
                            }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{
                              duration: 0.7,
                              ease: [0.34, 1.56, 0.64, 1],
                              times: [0, 0.2, 0.4, 0.8, 1],
                            }}
                            className="pointer-events-none absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap"
                            style={{ transformOrigin: "center bottom" }}
                          >
                            <span className="rounded-full border border-border bg-background/95 px-2.5 py-1 text-base font-bold text-foreground shadow-md backdrop-blur-sm">
                              +1
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      <button
                        onClick={() =>
                          document
                            .getElementById("comments-section")
                            ?.scrollIntoView({ behavior: "smooth" })
                        }
                        className="flex items-center gap-1.5 text-[14px] text-muted-foreground transition-colors hover:text-foreground"
                      >
                        <CommentIcon className="h-5 w-5" />
                        <span className="text-[14px] font-medium">
                          {postData?.comments?.length || 0}
                        </span>
                      </button>

                      <div className="group relative" ref={scorePopoverRef}>
                        <button
                          onClick={() => {
                            if (!isAuthenticated) {
                              showToast({
                                message: "Sign in to upvote posts",
                                type: "info",
                              });
                              return;
                            }
                            if (isCurator === false) {
                              showToast({
                                message: "Only curators can upvote posts",
                                type: "info",
                              });
                              return;
                            }
                            if (hasVotedOnPost === true) {
                              showToast({
                                message: "You've already voted on this post.",
                                type: "info",
                              });
                              return;
                            }
                            if (!isPostOnChainFailed) {
                              setShowScorePopover(!showScorePopover);
                            }
                          }}
                          aria-disabled={
                            isPostOnChainFailed || hasVotedOnPost === true
                          }
                          title={
                            !isAuthenticated
                              ? "Sign in to upvote posts"
                              : isCurator === false
                              ? "Only curators can upvote posts"
                              : hasVotedOnPost === true
                              ? "You've already voted on this post"
                              : undefined
                          }
                          className={`flex items-center gap-1.5 text-[14px] transition-colors ${
                            hasVotedOnPost === true
                              ? "cursor-not-allowed text-foreground"
                              : isPostOnChainFailed ||
                                !isAuthenticated ||
                                isCurator === false
                              ? "cursor-not-allowed text-muted-foreground opacity-50"
                              : "text-muted-foreground hover:text-foreground"
                          }`}
                        >
                          <UpvoteIcon className="h-5 w-5" />
                          <span className="text-[14px] font-medium">
                            {postScore ? postScore.toString() : "0"}
                          </span>
                        </button>

                        {isPostOnChainFailed && (
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-60 -translate-x-1/2 rounded-md border border-border bg-background px-2.5 py-1.5 text-center text-xs leading-relaxed text-muted-foreground shadow-md group-hover:block">
                            This post has failed to update to the blockchain.
                            It will be added in some time.
                          </span>
                        )}

                        {!isPostOnChainFailed &&
                          isAuthenticated &&
                          isCurator !== false &&
                          hasVotedOnPost === true && (
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-52 -translate-x-1/2 rounded-md border border-border bg-background px-2.5 py-1.5 text-center text-xs leading-relaxed text-muted-foreground shadow-md group-hover:block">
                            You&apos;ve already voted on this post.
                          </span>
                        )}

                        {!isPostOnChainFailed && isAuthenticated && isCurator === false && (
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden w-52 -translate-x-1/2 rounded-md border border-border bg-background px-2.5 py-1.5 text-center text-xs leading-relaxed text-muted-foreground shadow-md group-hover:block">
                            Only curators can upvote posts.
                          </span>
                        )}

                        {showScorePopover &&
                          !isPostOnChainFailed &&
                          isAuthenticated &&
                          isCurator !== false && (
                          <div className="upvote-popover absolute bottom-full left-0 z-50 mb-2 w-64 rounded-lg border border-border bg-background p-3 shadow-lg">
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-foreground">
                                  Upvote
                                </span>
                                <button
                                  onClick={() => setShowScorePopover(false)}
                                  className="text-muted-foreground hover:text-foreground"
                                >
                                  <X className="h-4 w-4" />
                                </button>
                              </div>
                              <p className="text-xs leading-relaxed text-muted-foreground">
                                Upvoting is action tied to blockchain and can&apos;t
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
                                <span className="w-8 text-right text-xs text-muted-foreground">
                                  {voteWeight}%
                                </span>
                              </div>
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  if (voteWeight > 0) {
                                    console.log("Submitting upvote with weight:", voteWeight);
                                    handleVote(e);
                                    setShowScorePopover(false);
                                  }
                                  console.log("Vote weight:", voteWeight);
                                }}
                                disabled={
                                  isScorePending ||
                                  voteWeight === 0 ||
                                  isTokenBalanceLoading ||
                                  hasVotedOnPost === true
                                }
                                title={
                                  hasVotedOnPost === true
                                    ? "You've already voted on this post"
                                    : voteWeight === 0
                                    ? "Move the slider above 0% to upvote"
                                    : undefined
                                }
                                className="w-full"
                              >
                                {isScorePending ? (
                                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                ) : (
                                  <UpvoteIcon className="mr-1.5 h-4 w-4" />
                                )}
                                <span>Submit Upvote</span>
                              </Button>
                              {hasVotedOnPost === true ? (
                                <p className="text-xs text-muted-foreground">
                                  You&apos;ve already voted on this post.
                                </p>
                              ) : (
                                voteWeight === 0 && (
                                  <p className="text-xs text-muted-foreground">
                                    Move the slider above 0% to upvote.
                                  </p>
                                )
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right Group: Bookmark, More */}
                    <div className="flex items-center gap-5">
                      <button className="text-muted-foreground transition-colors hover:text-foreground">
                        <BookmarkIcon className="h-5 w-5" />
                      </button>
                      <button className="text-muted-foreground transition-colors hover:text-foreground">
                        <MoreHorizontal className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                <div id="comments-section" className="border-b border-border bg-background px-3 py-5">
                  <CommentsSection
                    postUuid={uuid}
                    comments={postData?.comments || []}
                  />
                </div>

                {/* Author Bio */}
                <div className="border-b border-border bg-background px-3 py-5">
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border border-border">
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
                      <p className="text-sm font-medium text-foreground">
                        {authorProfile?.profile?.username ||
                          authorProfile?.profile?.fullName ||
                          postData.author?.email ||
                          postData.authorAddress?.slice(0, 6) + "..." ||
                          "Anonymous"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {authorProfile?.profile?.bio || "Author"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs text-muted-foreground border-border hover:bg-muted"
                    >
                      Follow
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
