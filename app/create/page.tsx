"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAccount, useBalance, useBlock, usePublicClient } from "wagmi";
import { BaseError, ContractFunctionRevertedError, formatUnits } from "viem";
import { ConfirmActionModal } from "@/components/modal/confirmActionModal";
import {
  useReadCurateAiPostsLastPostTime,
  useReadCurateAiPostsPostCounter,
  useReadCurateAiPostsPostResetBurnAmount,
  useWriteCurateAiPostsCreatePost,
  useWriteCurateAiPostsResetPostCooldown,
  useReadCurateAiRoleManagerCuratorRole,
  useReadCurateAiRoleManagerHasRole,
  useReadCuratAiTokenAllowance,
  useWriteCuratAiTokenApprove,
} from "@/hooks/wagmi/contracts";
import {
  usePublishPost,
  useUpdatePost,
  useGetPostIdFromTransaction,
} from "@/hooks/api/create";
import { useContractAddresses } from "@/context/contractAddresses.provider";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import {
  TOKEN_DISPLAY_NAMES,
  RPC_POLL_INTERVAL_MS,
  RPC_BLOCK_POLL_INTERVAL_MS,
} from "@/constants/chain";
import { useSaveDraft, useGetDraft } from "@/hooks/api/drafts";
import MarkdownIt from "markdown-it";
import AdvancedEditor from "@/components/advanced-editor";
import { Button } from "@/components/ui/button";
import { SuccessButton, useActionStatus } from "@/components/ui/SuccessButton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import HomeNavbar from "@/components/ui/HomeNavbar";
import { X, Check, Loader2, Flame } from "lucide-react";
import { showToast } from "@/utils/showToast";

// Markdown parser for converting markdown to HTML
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

// Minimum native token balance required to cover gas for the publish
// transaction. Frontend-only guardrail — the chain itself will still reject
// an underfunded transaction, this just avoids sending users into that wall.
const MIN_NATIVE_BALANCE_FOR_GAS = 0.01;

// Decodes a wagmi/viem write error down to the actual on-chain revert reason
// (custom error name + args, or a require() string) instead of the opaque
// error object we were previously just console.error-ing wholesale.
const decodeContractError = (error: unknown): string => {
  if (error instanceof BaseError) {
    const revertError = error.walk(
      (e) => e instanceof ContractFunctionRevertedError
    );
    if (revertError instanceof ContractFunctionRevertedError) {
      const errorName = revertError.data?.errorName ?? "";
      const args = revertError.data?.args;
      return args?.length ? `${errorName}(${args.join(", ")})` : errorName || revertError.shortMessage;
    }
    return error.shortMessage ?? error.message;
  }
  return error instanceof Error ? error.message : String(error);
};

// Get user UUID from JWT token, same pattern used in HomeNavbar/RightSidebar
const getUserIdFromToken = (): string | null => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.uuid || payload.userId || payload.sub || payload.id || null;
  } catch {
    return null;
  }
};

export default function CreateRevampPage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isAssistantCollapsed, setIsAssistantCollapsed] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);
  const [currentDraftUuid, setCurrentDraftUuid] = useState<string | undefined>(
    undefined
  );
  const [saveStatus, setSaveStatus] = useState<
    "idle" | "unsaved" | "saving" | "saved"
  >("idle");
  const [isLowBalanceModalOpen, setIsLowBalanceModalOpen] = useState(false);

  // Character limit constant
  const MAX_CONTENT_LENGTH = 20000;

  // Calculate total character count (content + tags)
  const calculateTotalCharacters = () => {
    const contentLength = markdownContent.length;
    const tagsLength = tags.join(",").length;
    return contentLength + tagsLength;
  };

  const totalCharacters = calculateTotalCharacters();
  const isOverLimit = totalCharacters > MAX_CONTENT_LENGTH;
  const remainingCharacters = MAX_CONTENT_LENGTH - totalCharacters;

  const router = useRouter();
  const searchParams = useSearchParams();
  const draftUuidFromUrl = searchParams.get("draft");
  const { address: account } = useAccount();
  const { contracts } = useContractAddresses();
  const { data: nativeBalance } = useBalance({
    address: account,
    query: {
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
  });
  const tagInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: saveDraftMutation } = useSaveDraft();

  // Fetch draft if UUID is in URL
  const { data: loadedDraft, isLoading: isLoadingDraft } =
    useGetDraft(draftUuidFromUrl);

  const {
    writeContractAsync,
    isPending: contractPending,
    error,
  } = useWriteCurateAiPostsCreatePost();

  const { mutateAsync: apiPublishPost } = usePublishPost();
  const { mutateAsync: apiUpdatePost } = useUpdatePost();
  const { getPostIdFromTransaction } = useGetPostIdFromTransaction();

  // The post contract requires CURATOR_ROLE to post at all — check it
  // up front so we don't send unapproved users into a doomed transaction.
  const { data: curatorRole } = useReadCurateAiRoleManagerCuratorRole({
    address: contracts?.role as `0x${string}`,
    query: { enabled: !!contracts },
  });
  const { data: isCurator, isLoading: isCuratorRoleLoading } =
    useReadCurateAiRoleManagerHasRole({
      address: contracts?.role as `0x${string}`,
      args:
        account && curatorRole ? [curatorRole, account] : undefined,
      query: {
        enabled: !!account && !!contracts && !!curatorRole,
        refetchInterval: RPC_POLL_INTERVAL_MS,
        staleTime: RPC_POLL_INTERVAL_MS,
      },
    });
  // While the role check is still loading, don't block — avoids a flash of
  // "not approved" for a user who actually is approved.
  const isNotApprovedToPost =
    !!account && !isCuratorRoleLoading && isCurator === false;

  // The post contract only allows one post per rolling 24h window:
  // block.timestamp >= lastPostTime[author] + 1 days.
  const { data: lastPostTime } = useReadCurateAiPostsLastPostTime({
    address: contracts?.post as `0x${string}`,
    args: account ? [account] : undefined,
    query: {
      enabled: !!account && !!contracts,
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
  });
  // Chain time can drift from wall-clock time (e.g. a local node after
  // evm_increaseTime, or a stale latest block), so take the later of the two.
  const { data: latestBlock } = useBlock({
    query: {
      refetchInterval: RPC_BLOCK_POLL_INTERVAL_MS,
      staleTime: RPC_BLOCK_POLL_INTERVAL_MS,
    },
  });
  // Ticks every 30s so the countdown on the publish button stays current.
  const [clockTick, setClockTick] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setClockTick(Date.now()), 30_000);
    return () => clearInterval(id);
  }, []);
  const nowSeconds = Math.max(
    Math.floor(clockTick / 1000),
    Number(latestBlock?.timestamp ?? 0)
  );
  const nextPostAllowedAt = lastPostTime ? Number(lastPostTime) + 86_400 : 0;
  const hasPostedToday = !!lastPostTime && nowSeconds < nextPostAllowedAt;
  const remainingMinutes = hasPostedToday
    ? Math.ceil((nextPostAllowedAt - nowSeconds) / 60)
    : 0;
  const remainingLabel = `${Math.floor(remainingMinutes / 60)}:${String(
    remainingMinutes % 60
  ).padStart(2, "0")}`;

  // post.sol's resetPostCooldown() lets a curator burn CAT to skip the
  // remaining 24h wait instead of waiting it out. The burn amount is a
  // contract setting (SUPER_ADMIN_ROLE-tunable), read live rather than
  // hardcoded so this can't drift from the deployed value.
  const { data: postResetBurnAmount } = useReadCurateAiPostsPostResetBurnAmount(
    {
      address: contracts?.post as `0x${string}`,
      query: { enabled: !!contracts, staleTime: Infinity },
    }
  );
  const { balance: catBalance } = useCatTokenBalance();
  // resetPostCooldown() calls token.burnFrom(), which requires the Post
  // contract to already hold an ERC20 allowance from this account — check
  // it so we only prompt for an approve tx when one is actually needed.
  const { data: tokenAllowance, refetch: refetchAllowance } =
    useReadCuratAiTokenAllowance({
      address: contracts?.token as `0x${string}`,
      args:
        account && contracts?.post
          ? [account, contracts.post as `0x${string}`]
          : undefined,
      query: {
        enabled: !!account && !!contracts,
        refetchInterval: RPC_POLL_INTERVAL_MS,
        staleTime: RPC_POLL_INTERVAL_MS,
      },
    });
  const { writeContractAsync: writeApprove } = useWriteCuratAiTokenApprove();
  const { writeContractAsync: writeResetCooldown, isPending: isResettingCooldown } =
    useWriteCurateAiPostsResetPostCooldown();
  const { status: resetCooldownStatus, run: runResetCooldown } =
    useActionStatus(1000);
  const publicClient = usePublicClient();
  const [isResetPopoverOpen, setIsResetPopoverOpen] = useState(false);
  // Rendered via a portal (see below) instead of a plain absolutely-
  // positioned child, since the trigger sits inside the sticky title bar —
  // an `overflow-hidden` ancestor was clipping/hiding an in-flow popover
  // behind the navbar. Position is computed from the trigger's own rect.
  const [resetPopoverPosition, setResetPopoverPosition] = useState<{
    top: number;
    left: number;
  } | null>(null);
  const resetTriggerRef = useRef<HTMLButtonElement>(null);
  const resetPopoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        resetTriggerRef.current?.contains(target) ||
        resetPopoverRef.current?.contains(target)
      ) {
        return;
      }
      setIsResetPopoverOpen(false);
    };
    if (isResetPopoverOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isResetPopoverOpen]);

  const toggleResetPopover = () => {
    if (!isResetPopoverOpen && resetTriggerRef.current) {
      const rect = resetTriggerRef.current.getBoundingClientRect();
      const popoverWidth = 288; // w-72
      setResetPopoverPosition({
        top: rect.bottom + 8,
        left: Math.min(rect.left, window.innerWidth - popoverWidth - 16),
      });
    }
    setIsResetPopoverOpen((open) => !open);
  };

  const handleResetCooldown = async () => {
    if (!account || !contracts || postResetBurnAmount === undefined) {
      return;
    }
    if (catBalance !== undefined && catBalance < postResetBurnAmount) {
      showToast({
        message: `You need at least ${postResetBurnAmount.toString()} CAT to reset your cooldown.`,
        type: "error",
      });
      return;
    }
    try {
      await runResetCooldown(async () => {
        if (
          tokenAllowance === undefined ||
          tokenAllowance < postResetBurnAmount
        ) {
          const approveHash = await writeApprove({
            address: contracts.token as `0x${string}`,
            args: [contracts.post as `0x${string}`, postResetBurnAmount],
          });
          if (publicClient) {
            await publicClient.waitForTransactionReceipt({
              hash: approveHash as `0x${string}`,
            });
          }
          await refetchAllowance();
        }
        await writeResetCooldown({
          address: contracts.post as `0x${string}`,
        });
      }, () => {
        // Reload once the success tick has played, so every bit of state
        // derived from the old cooldown (button labels, draft gating,
        // cached allowance/balance reads, etc.) is guaranteed fresh rather
        // than trusting every affected read to refetch itself correctly.
        setIsResetPopoverOpen(false);
        window.location.reload();
      });
    } catch (err) {
      const reason = decodeContractError(err);
      console.error("Reset cooldown failed:", reason, err);
      showToast({
        message: `Failed to reset cooldown: ${reason}`,
        type: "error",
      });
    }
  };

  const handlePublish = () => {
    if (isNotApprovedToPost) {
      showToast({
        message:
          "Your account is not yet approved to post. Please contact support.",
        type: "error",
      });
      return;
    }
    if (hasPostedToday) {
      showToast({
        message:
          "You've already posted today. You can publish again 24 hours after your last post.",
        type: "error",
      });
      return;
    }
    if (!title.trim()) {
      showToast({ message: "Add a title before publishing", type: "error" });
      return;
    }
    // Frontend-only guardrail: don't send users into a publish flow that's
    // going to fail on-chain from insufficient gas.
    const nativeBalanceValue = nativeBalance
      ? parseFloat(formatUnits(nativeBalance.value, nativeBalance.decimals))
      : 0;
    if (nativeBalanceValue < MIN_NATIVE_BALANCE_FOR_GAS) {
      setIsLowBalanceModalOpen(true);
      return;
    }
    // Check character limit before opening tag modal
    if (isOverLimit) {
      showToast({
        message: `Content exceeds the maximum limit of ${MAX_CONTENT_LENGTH} characters. Please reduce your content by ${
          totalCharacters - MAX_CONTENT_LENGTH
        } characters.`,
        type: "error",
      });
      return;
    }
    setIsTagModalOpen(true);
  };

  const handleTagModalConfirm = () => {
    // Double-check character limit before confirming
    if (isOverLimit) {
      showToast({
        message: `Content exceeds the maximum limit of ${MAX_CONTENT_LENGTH} characters. Please reduce your content by ${
          totalCharacters - MAX_CONTENT_LENGTH
        } characters.`,
        type: "error",
      });
      return;
    }
    setIsTagModalOpen(false);
    setIsConfirmOpen(true);
  };

  const { data: postCount } = useReadCurateAiPostsPostCounter({
    address: contracts?.post as `0x${string}`,
    query: { enabled: !!contracts },
  });

  const handleContractWrite = async () => {
    setIsPublishing(true);

    try {
      if (!account) {
        throw new Error("User wallet address not available");
      }
      if (!contracts) {
        throw new Error("Contract addresses not loaded yet. Please wait.");
      }

      // Remove markdown formatting (** for bold and # for headings) before sending to AI
      const cleanedContent = markdownContent
        .replace(/\*\*/g, "") // Remove ** (bold markdown)
        .replace(/#{1,6}\s/g, ""); // Remove # (heading markdown)

      // Step 1: Publish the post — backend pins referenced images + JSON
      // metadata to IPFS and creates the post row, all in one request.
      const publishResult = await apiPublishPost({
        title,
        content: cleanedContent,
        userWalletAddress: account,
        tags: tags.length > 0 ? tags : undefined,
        coverImageUrl: coverImage || undefined,
        // post.sol: `postId = postCounter++` is a post-increment, so the new
        // post's on-chain id equals the counter's current value, not +1.
        internal_id: Number(postCount) || 0,
      });

      const ipfsHash = publishResult.ipfsHash;

      if (publishResult.failedImages?.length) {
        showToast({
          message:
            "Post published, but some images couldn't be pinned to IPFS yet. They'll still display normally.",
          type: "error",
        });
      }

      let txHash: string | undefined;
      let blockchainError = false;
      let blockchainErrorReason: string | undefined;

      try {
        const result = await writeContractAsync({
          address: contracts.post as `0x${string}`,
          args: [ipfsHash, tags.join(",") || "general"],
        });

        // Handle different return types from wagmi
        if (typeof result === "string") {
          txHash = result;
        } else if (result && typeof result === "object" && "hash" in result) {
          txHash = (result as any).hash;
        } else {
          console.error("Unexpected transaction result format:", result);
          txHash = undefined;
        }

      } catch (txError) {
        blockchainErrorReason = decodeContractError(txError);
        console.error(
          "Blockchain transaction failed:",
          blockchainErrorReason,
          txError
        );
        blockchainError = true;
        txHash = undefined;
        showToast({
          message: `On-chain post creation failed: ${blockchainErrorReason}`,
          type: "error",
        });
      }

      // Step 4: Update post with transaction hash and status
      console.log("Step 4: Updating post with transaction hash...");
      await apiUpdatePost({
        postUuid: publishResult.uuid,
        transactionHash: txHash,
        status: blockchainError ? "BLOCKCHAIN_FAILED" : "BLOCKCHAIN_INITIATED",
      });

      setIsConfirmOpen(false);

      // Redirect to the created post
      if (publishResult.uuid) {
        router.push(`/post/${publishResult.uuid}`);
      } else {
        console.error("No UUID returned from post creation");
        router.push("/home");
      }
    } catch (err) {
      console.error("Post creation failed:", err);
      showToast({
        message: "Failed to publish post. Please try again.",
        type: "error",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const confirmAction = async () => {
    if (!account) {
      showToast({
        message: "Wallet address not available. Please try logging in again.",
        type: "error",
      });
      return;
    }

    // Final check before publishing
    if (isOverLimit) {
      showToast({
        message: `Content exceeds the maximum limit of ${MAX_CONTENT_LENGTH} characters. Please reduce your content by ${
          totalCharacters - MAX_CONTENT_LENGTH
        } characters.`,
        type: "error",
      });
      return;
    }

    // Proceed directly to contract write (which uses IPFS)
    handleContractWrite();
  };

  const handleInsertContent = (content: string) => {
    // If editor is empty, just set the content
    if (!editorContent.trim()) {
      setEditorContent(content);
    } else {
      // Otherwise append to existing content
      setEditorContent((prev) => `${prev}\n\n${content}`);
    }
  };

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  // Load draft when UUID is provided in URL (only once)
  const hasLoadedDraft = useRef(false);
  useEffect(() => {
    if (loadedDraft && !isLoadingDraft && !hasLoadedDraft.current) {
      hasLoadedDraft.current = true;
      if (loadedDraft.title) {
        setTitle(loadedDraft.title);
      }
      if (loadedDraft.content) {
        // Set markdown content (this is what gets saved)
        setMarkdownContent(loadedDraft.content);
        // Convert markdown to HTML for the editor (TipTap expects HTML)
        const htmlContent = md.render(loadedDraft.content);
        setEditorContent(htmlContent);
      }
      if (loadedDraft.uuid) {
        setCurrentDraftUuid(loadedDraft.uuid);
      }
    }
  }, [loadedDraft, isLoadingDraft]);

  // Auto-save when title or content changes (but skip if we're loading a draft)
  useEffect(() => {
    // Don't auto-save while loading a draft from URL
    if (isLoadingDraft) {
      return;
    }

    // Only save if there's at least a title or content
    if (!title.trim() && !markdownContent.trim()) {
      return;
    }

    setSaveStatus("unsaved");

    const timeoutId = setTimeout(async () => {
      setSaveStatus("saving");
      try {
        const savedDraft = await saveDraftMutation({
          title: title.trim() || undefined,
          content: markdownContent.trim() || undefined,
          uuid: currentDraftUuid || draftUuidFromUrl || undefined,
        });
        // Update draft UUID if this was a new draft
        if (!currentDraftUuid && savedDraft.uuid) {
          setCurrentDraftUuid(savedDraft.uuid);
        }
        setSaveStatus("saved");
      } catch (error) {
        console.error("Failed to save draft:", error);
        // Silently fail - don't interrupt user's writing
        setSaveStatus("unsaved");
      }
    }, 2000); // 2 second debounce

    return () => clearTimeout(timeoutId);
  }, [
    title,
    markdownContent,
    currentDraftUuid,
    saveDraftMutation,
    draftUuidFromUrl,
    isLoadingDraft,
  ]);

  return (
    <div className="flex flex-col h-screen bg-background checkered-bg">
      <style jsx global>{`
        /* Subtle checkered texture, retinted to near-white/neutral tones */
        .checkered-bg {
          background-image: linear-gradient(
              45deg,
              rgba(26, 26, 26, 0.015) 25%,
              transparent 25%
            ),
            linear-gradient(-45deg, rgba(26, 26, 26, 0.015) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(26, 26, 26, 0.015) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(26, 26, 26, 0.015) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }

        .prose {
          --tw-prose-headings: #1a1a1a;
          --tw-prose-body: #1a1a1a;
          --tw-prose-links: #072f5f;
          --tw-prose-bold: #1a1a1a;
          --tw-prose-counters: #6b6b6b;
          --tw-prose-bullets: #6b6b6b;
          --tw-prose-hr: #e6e5e0;
          --tw-prose-quotes: #1a1a1a;
          --tw-prose-quote-borders: #e6e5e0;
          --tw-prose-captions: #6b6b6b;
          --tw-prose-code: #1a1a1a;
          --tw-prose-pre-code: #f0efea;
          --tw-prose-pre-bg: #1a1a1a;
          --tw-prose-th-borders: #e6e5e0;
          --tw-prose-td-borders: #e6e5e0;
        }

        /* Style headings in editor */
        .prose h1,
        .ProseMirror h1 {
          font-size: 1.875rem !important;
          font-weight: 800 !important;
          margin-top: 2rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.2 !important;
          color: #1a1a1a !important;
        }

        .prose h2,
        .ProseMirror h2 {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.3 !important;
          color: #1a1a1a !important;
        }

        /* Style links in editor - accent indigo */
        .prose a,
        .ProseMirror a {
          color: #072f5f !important;
          text-decoration: underline !important;
        }

        .prose a:hover,
        .ProseMirror a:hover {
          color: #051f40 !important;
        }

        /* Increase spacing between paragraphs in editor */
        .prose p,
        .ProseMirror p {
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
        }

        .prose p:first-child,
        .ProseMirror p:first-child {
          margin-top: 0 !important;
        }

        .prose p:last-child,
        .ProseMirror p:last-child {
          margin-bottom: 0 !important;
        }

        /* Ensure proper spacing after headings */
        .prose h1 + p,
        .prose h2 + p,
        .ProseMirror h1 + p,
        .ProseMirror h2 + p {
          margin-top: 0.75rem !important;
        }

        /* Style lists in editor - show bullet points and numbers */
        .prose ul,
        .ProseMirror ul {
          list-style-type: disc !important;
          padding-left: 1.5rem !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
        }

        .prose ol,
        .ProseMirror ol {
          list-style-type: decimal !important;
          padding-left: 1.5rem !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
        }

        .prose li,
        .ProseMirror li {
          display: list-item !important;
          list-style-position: outside !important;
          margin-top: 0.5rem !important;
          margin-bottom: 0.5rem !important;
          padding-left: 0.5rem !important;
        }

        .prose ul li::marker,
        .ProseMirror ul li::marker {
          color: #1a1a1a !important;
          font-size: 1.2em !important;
        }

        .prose ol li::marker,
        .ProseMirror ol li::marker {
          color: #1a1a1a !important;
          font-weight: 600 !important;
        }

        /* Style code blocks in editor */
        .prose pre,
        .ProseMirror pre {
          background-color: #1a1a1a !important;
          color: #f0efea !important;
          padding: 1rem !important;
          border-radius: 0.5rem !important;
          margin-top: 1rem !important;
          margin-bottom: 1rem !important;
          overflow-x: auto !important;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important;
          font-size: 0.875rem !important;
          line-height: 1.5 !important;
        }

        .prose pre code,
        .ProseMirror pre code {
          background-color: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          border-radius: 0 !important;
          font-size: inherit !important;
        }

        /* Style inline code in editor */
        .prose code:not(pre code),
        .ProseMirror code:not(pre code) {
          background-color: #f0efea !important;
          color: #1a1a1a !important;
          padding: 0.125rem 0.375rem !important;
          border-radius: 0.25rem !important;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important;
          font-size: 0.875em !important;
        }

        /* Show a clear border when an image is selected in the editor,
           so it's obvious which image will be affected by Backspace/Delete */
        .ProseMirror img {
          cursor: pointer;
          border-radius: 0.375rem;
          transition: outline-color 0.15s ease;
          outline: 2px solid transparent;
          outline-offset: 2px;
        }

        .ProseMirror img:hover {
          outline-color: #e6e5e0;
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 3px solid #072f5f;
          outline-offset: 2px;
        }

        /* Hide scrollbar in create page */
        .create-scrollable::-webkit-scrollbar {
          display: none;
        }
        .create-scrollable {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Top Navbar */}
      <HomeNavbar />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden pt-[60px]">
        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-background">
          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {isLoadingDraft && draftUuidFromUrl ? (
              <div className="flex flex-1 items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Loading draft...</span>
              </div>
            ) : (
              <>
                {/* Sticky Title Bar */}
                <div className="flex justify-center bg-background sticky top-0 z-10 border-b border-border">
                  <div className="w-full max-w-4xl px-4 md:px-8">
                    <div className="flex items-center gap-4 py-4">
                      <input
                        type="text"
                        placeholder="Title..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="flex-1 min-w-0 text-2xl font-serif font-bold text-foreground border-0 focus:outline-none focus:ring-0 placeholder-muted-foreground"
                      />
                      <div className="flex shrink-0 items-center gap-4">
                        <div className="hidden sm:flex items-center gap-1.5 text-xs text-muted-foreground w-20">
                          {saveStatus === "saving" && (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Saving...</span>
                            </>
                          )}
                          {saveStatus === "saved" && (
                            <>
                              <Check className="h-3 w-3 text-primary" />
                              <span>Saved</span>
                            </>
                          )}
                          {saveStatus === "unsaved" && <span>Unsaved</span>}
                        </div>
                        <span
                          className={`hidden md:inline text-xs ${
                            isOverLimit
                              ? "text-destructive font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {remainingCharacters.toLocaleString()} left
                        </span>
                        <Button
                          onClick={handlePublish}
                          disabled={
                            !title.trim() ||
                            isOverLimit ||
                            hasPostedToday ||
                            isNotApprovedToPost
                          }
                          size="sm"
                          className="bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                          {isNotApprovedToPost
                            ? "Not approved to post"
                            : hasPostedToday
                              ? `You can publish after ${remainingLabel} hrs`
                              : "Publish"}
                        </Button>
                      </div>
                    </div>
                    {isNotApprovedToPost ? (
                      <p className="pb-3 text-xs text-muted-foreground">
                        Your account is not yet approved to post. Please
                        contact support.
                      </p>
                    ) : (
                      hasPostedToday && (
                        <div className="pb-3">
                          <p className="pb-2 text-xs text-muted-foreground">
                            You&apos;ve already posted today. Keep writing —
                            your work is auto-saved as a draft, so you can
                            publish it once the timer runs out.
                          </p>
                          <button
                            ref={resetTriggerRef}
                            onClick={toggleResetPopover}
                            title={
                              postResetBurnAmount !== undefined
                                ? `Burn ${postResetBurnAmount.toString()} CAT to post again immediately`
                                : undefined
                            }
                            className="inline-flex items-center gap-1.5 rounded-md border border-destructive/40 bg-destructive/5 px-2.5 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive/10"
                          >
                            <Flame className="h-3.5 w-3.5" />
                            Reset cooldown
                            {postResetBurnAmount !== undefined
                              ? ` (burn ${postResetBurnAmount.toString()} CAT)`
                              : ""}
                          </button>

                          {isResetPopoverOpen &&
                            resetPopoverPosition &&
                            typeof document !== "undefined" &&
                            createPortal(
                              <div
                                ref={resetPopoverRef}
                                style={{
                                  position: "fixed",
                                  top: resetPopoverPosition.top,
                                  left: resetPopoverPosition.left,
                                }}
                                className="z-[100] w-72 rounded-lg border border-border bg-background p-3 shadow-lg"
                              >
                                <div className="space-y-2.5">
                                  <div className="flex items-center justify-between">
                                    <span className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                                      <Flame className="h-4 w-4 text-destructive" />
                                      Reset cooldown
                                    </span>
                                    <button
                                      onClick={() => setIsResetPopoverOpen(false)}
                                      className="text-muted-foreground hover:text-foreground"
                                    >
                                      <X className="h-4 w-4" />
                                    </button>
                                  </div>
                                  <p className="text-xs leading-relaxed text-muted-foreground">
                                    This will burn{" "}
                                    <span className="font-medium text-foreground">
                                      {postResetBurnAmount !== undefined
                                        ? postResetBurnAmount.toString()
                                        : "500"}{" "}
                                      CAT
                                    </span>{" "}
                                    from your wallet and immediately reset
                                    your daily post cooldown. This
                                    can&apos;t be undone.
                                  </p>
                                  <SuccessButton
                                    size="sm"
                                    variant="destructive"
                                    onClick={handleResetCooldown}
                                    status={resetCooldownStatus}
                                    disabled={
                                      isResettingCooldown ||
                                      postResetBurnAmount === undefined
                                    }
                                    loadingChildren={
                                      <>
                                        <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />
                                        Burning...
                                      </>
                                    }
                                    className="w-full"
                                  >
                                    <Flame className="mr-1.5 h-4 w-4" />
                                    Burn &amp; reset
                                  </SuccessButton>
                                </div>
                              </div>,
                              document.body
                            )}
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* Scrollable Editor Section */}
                <div className="flex-1 overflow-hidden">
                  <div className="h-full flex justify-center">
                    <div className="w-full max-w-4xl px-4 md:px-8">
                      <AdvancedEditor
                        initialContent={editorContent}
                        setMarkdownContent={setMarkdownContent}
                        markdownContent={markdownContent}
                        onPublish={handlePublish}
                        isPublishing={isPublishing}
                        canPublish={
                          !!title &&
                          !isOverLimit &&
                          !hasPostedToday &&
                          !isNotApprovedToPost
                        }
                        maxContentLength={MAX_CONTENT_LENGTH}
                        currentContentLength={markdownContent.length}
                        tagsLength={tags.join(",").length}
                        onImageDataUpdate={(imageData) => {
                          if (typeof imageData === "string") {
                            setCoverImage(imageData);
                          } else if (
                            imageData &&
                            typeof imageData === "object" &&
                            "url" in imageData
                          ) {
                            setCoverImage((imageData as any).url);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tag Input Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-foreground/10 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg shadow-sm p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Add Tags to Your Post
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add up to 5 tags to help readers discover your post
            </p>

            <div className="space-y-4">
              {/* Current Tags */}
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="bg-accent text-accent-foreground hover:bg-accent/80 px-3 py-1"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-muted-foreground hover:text-foreground"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}

              {/* Tag Input */}
              {tags.length < 5 && (
                <div className="relative">
                  <input
                    ref={tagInputRef}
                    type="text"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    className="w-full bg-muted border border-border text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-border focus:border-border placeholder-muted-foreground text-foreground"
                  />
                </div>
              )}

              <div className="text-xs text-muted-foreground">
                {tags.length}/5 tags added
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsTagModalOpen(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTagModalConfirm}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Continue to Publish
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Low Balance Modal */}
      {isLowBalanceModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-foreground/10 flex items-center justify-center z-50">
          <div className="bg-background border border-border rounded-lg shadow-sm p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4 text-foreground">
              Insufficient balance
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              You need at least {MIN_NATIVE_BALANCE_FOR_GAS}{" "}
              {TOKEN_DISPLAY_NAMES.SONIC} to cover the gas fee for publishing.
              Top up your wallet and try again.
            </p>

            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setIsLowBalanceModalOpen(false)}
                className="border-border"
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  setIsLowBalanceModalOpen(false);
                  const userId = getUserIdFromToken();
                  router.push(userId ? `/profile/${userId}` : "/profile");
                }}
                className="bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                Go to Wallet
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmAction}
        actionText="Publish Story"
      />
    </div>
  );
}
