"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAccount } from "wagmi";
import { ConfirmActionModal } from "@/components/modal/confirmActionModal";
import {
  useReadCurateAiPostsPostCounter,
  useWriteCurateAiPostsCreatePost,
} from "@/hooks/wagmi/contracts";
import {
  useCreatePost,
  useUpdatePost,
  useGetPostIdFromTransaction,
} from "@/hooks/api/create";
import { useIPFSUpload } from "@/hooks/ipfs/uploadToIpfs";
import { contract } from "@/constants/contract";
import { useSaveDraft, useGetDraft } from "@/hooks/api/drafts";
import MarkdownIt from "markdown-it";
import AdvancedEditor from "@/components/advanced-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import HomeNavbar from "@/components/ui/HomeNavbar";
import { LeftSidebar } from "@/components/home-revamp";
import { X } from "lucide-react";

// Markdown parser for converting markdown to HTML
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

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

  const {
    mutateAsync,
    isPending,
    data,
    isSuccess: isIPFSUploadSucees,
  } = useIPFSUpload();

  const { mutateAsync: apiMutatePost } = useCreatePost();
  const { mutateAsync: apiUpdatePost } = useUpdatePost();
  const { getPostIdFromTransaction } = useGetPostIdFromTransaction();

  const handlePublish = () => {
    // Check character limit before opening tag modal
    if (isOverLimit) {
      alert(
        `Content exceeds the maximum limit of ${MAX_CONTENT_LENGTH} characters. Please reduce your content by ${
          totalCharacters - MAX_CONTENT_LENGTH
        } characters.`
      );
      return;
    }
    setIsTagModalOpen(true);
  };

  const handleTagModalConfirm = () => {
    // Double-check character limit before confirming
    if (isOverLimit) {
      alert(
        `Content exceeds the maximum limit of ${MAX_CONTENT_LENGTH} characters. Please reduce your content by ${
          totalCharacters - MAX_CONTENT_LENGTH
        } characters.`
      );
      return;
    }
    setIsTagModalOpen(false);
    setIsConfirmOpen(true);
  };

  const { data: postCount } = useReadCurateAiPostsPostCounter({
    address: contract.post as `0x${string}`,
  });

  const handleContractWrite = async () => {
    setIsPublishing(true);

    try {
      if (!account) {
        throw new Error("User wallet address not available");
      }

      // Step 1: Upload to IPFS using Pinata
      console.log("Step 1: Uploading to IPFS...");
      const data = {
        title,
        content: markdownContent,
        userWalletAddress: account || "",
        tags,
        coverImage,
      };

      console.log("🚀 Starting IPFS upload for publish...");
      console.log("📝 Upload data:", data);

      const ipfsResult = await mutateAsync(data);
      console.log("✅ IPFS upload successful:", ipfsResult);

      // Use the IPFS hash for the blockchain transaction
      const ipfsHash = ipfsResult.IpfsHash;

      // Step 2: Create post in database (without transaction hash)
      console.log("Step 2: Creating post in database...");
      // Remove markdown formatting (** for bold and # for headings) before sending to AI
      const cleanedContent = markdownContent
        .replace(/\*\*/g, "") // Remove ** (bold markdown)
        .replace(/#{1,6}\s/g, ""); // Remove # (heading markdown)
      const postResponse = await apiMutatePost({
        title,
        content: cleanedContent,
        ipfsHash,
        userWalletAddress: account,
        internal_id: Number(postCount) + 1 || 0,
        tags: tags.length > 0 ? tags : undefined,
        // No transaction hash at this step
      });

      console.log("Post created successfully:", postResponse);
      console.log("Post UUID:", postResponse.uuid);

      // Step 3: Execute blockchain transaction
      console.log("Step 3: Executing blockchain transaction...");
      let txHash: string | undefined;
      let blockchainError = false;

      try {
        const result = await writeContractAsync({
          address: contract.post as `0x${string}`,
          args: [ipfsHash, tags.join(",") || "general"],
        });

        console.log("result from contract", result);

        // Handle different return types from wagmi
        if (typeof result === "string") {
          txHash = result;
        } else if (result && typeof result === "object" && "hash" in result) {
          txHash = (result as any).hash;
        } else {
          console.error("Unexpected transaction result format:", result);
          txHash = undefined;
        }

        console.log("Transaction hash:", txHash);
      } catch (txError) {
        console.error("Blockchain transaction failed:", txError);
        blockchainError = true;
        txHash = undefined;
      }

      // Step 4: Update post with transaction hash and status
      console.log("Step 4: Updating post with transaction hash...");
      await apiUpdatePost({
        postUuid: postResponse.uuid,
        transactionHash: txHash,
        status: blockchainError ? "BLOCKCHAIN_FAILED" : "BLOCKCHAIN_INITIATED",
      });

      console.log("Post updated successfully");

      setIsConfirmOpen(false);

      // Redirect to the created post
      if (postResponse.uuid) {
        router.push(`/post-revamp/${postResponse.uuid}`);
      } else {
        console.error("No UUID returned from post creation");
        router.push("/home-revamp");
      }
    } catch (err) {
      console.error("Post creation failed:", err);
      alert("Failed to publish post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  const confirmAction = async () => {
    if (!account) {
      alert("User wallet address not available. Please try logging in again.");
      return;
    }

    // Final check before publishing
    if (isOverLimit) {
      alert(
        `Content exceeds the maximum limit of ${MAX_CONTENT_LENGTH} characters. Please reduce your content by ${
          totalCharacters - MAX_CONTENT_LENGTH
        } characters.`
      );
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

    const timeoutId = setTimeout(async () => {
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
      } catch (error) {
        console.error("Failed to save draft:", error);
        // Silently fail - don't interrupt user's writing
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

        /* Style headings in editor */
        .prose h1,
        .ProseMirror h1 {
          font-size: 1.875rem !important;
          font-weight: 800 !important;
          margin-top: 2rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.2 !important;
          color: #111827 !important;
        }

        .prose h2,
        .ProseMirror h2 {
          font-size: 1.5rem !important;
          font-weight: 700 !important;
          margin-top: 1.5rem !important;
          margin-bottom: 0.5rem !important;
          line-height: 1.3 !important;
          color: #111827 !important;
        }

        /* Style links in editor - make them blue */
        .prose a,
        .ProseMirror a {
          color: #2563eb !important;
          text-decoration: underline !important;
        }

        .prose a:hover,
        .ProseMirror a:hover {
          color: #1d4ed8 !important;
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
          color: #111827 !important;
          font-size: 1.2em !important;
        }

        .prose ol li::marker,
        .ProseMirror ol li::marker {
          color: #111827 !important;
          font-weight: 600 !important;
        }

        /* Style code blocks in editor */
        .prose pre,
        .ProseMirror pre {
          background-color: #1f2937 !important;
          color: #e5e7eb !important;
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
          background-color: #f3f4f6 !important;
          color: #111827 !important;
          padding: 0.125rem 0.375rem !important;
          border-radius: 0.25rem !important;
          font-family: "Monaco", "Menlo", "Ubuntu Mono", monospace !important;
          font-size: 0.875em !important;
        }

        /* Hide scrollbar in create-revamp */
        .create-revamp-scrollable::-webkit-scrollbar {
          display: none;
        }
        .create-revamp-scrollable {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

      {/* Top Navbar */}
      <HomeNavbar />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Left Sidebar - Hidden on mobile and tablet */}
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Sticky Title Bar */}
            <div className="flex justify-center bg-white sticky top-0 z-10">
              <div className="w-full max-w-4xl px-8 mt-6">
                <div className="py-4">
                  <input
                    type="text"
                    placeholder="Title..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-2xl font-bold text-gray-900 border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>

            {/* Scrollable Editor Section */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex justify-center">
                <div className="w-full max-w-4xl px-8">
                  <AdvancedEditor
                    initialContent={editorContent}
                    setMarkdownContent={setMarkdownContent}
                    markdownContent={markdownContent}
                    onPublish={handlePublish}
                    isPublishing={isPublishing}
                    canPublish={!!title && !isOverLimit}
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
          </div>
        </div>
      </div>

      {/* Tag Input Modal */}
      {isTagModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white bg-opacity-10 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">
              Add Tags to Your Post
            </h3>
            <p className="text-sm text-gray-600 mb-4">
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
                      className="bg-gray-50 text-gray-600 hover:bg-gray-100 px-3 py-1"
                    >
                      #{tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
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
                    className="w-full bg-gray-50 border border-gray-200 text-sm rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-gray-300 focus:border-gray-300 placeholder-gray-500"
                  />
                </div>
              )}

              <div className="text-xs text-gray-500">
                {tags.length}/5 tags added
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button
                variant="outline"
                onClick={() => setIsTagModalOpen(false)}
                className="border-gray-200"
              >
                Cancel
              </Button>
              <Button
                onClick={handleTagModalConfirm}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                Continue to Publish
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
