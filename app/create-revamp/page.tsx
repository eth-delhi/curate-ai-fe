"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
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
import AdvancedEditor from "@/components/advanced-editor";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import HomeNavbar from "@/components/ui/HomeNavbar";
import { Send, X, Sparkles } from "lucide-react";

// Dummy data for right sidebar
const DUMMY_USERS = [
  { name: "Alena Gouse", following: false },
  { name: "James Wilson", following: true },
  { name: "Sarah Chen", following: false },
];

const DUMMY_TRENDS = [
  { title: "AI Writing Tools", author: "Tech Writer" },
  { title: "Blockchain Content", author: "Crypto Expert" },
  { title: "Web3 Trends", author: "DeFi Analyst" },
];

const DUMMY_TOPICS = [
  "Technology",
  "AI",
  "Blockchain",
  "Web3",
  "Crypto",
  "DeFi",
  "NFT",
  "Programming",
];

export default function CreateRevampPage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isAssistantCollapsed, setIsAssistantCollapsed] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isTagModalOpen, setIsTagModalOpen] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const router = useRouter();
  const { address: account } = useAccount();
  const tagInputRef = useRef<HTMLInputElement>(null);

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
    setIsTagModalOpen(true);
  };

  const handleTagModalConfirm = () => {
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
      const postResponse = await apiMutatePost({
        title,
        content: markdownContent,
        ipfsHash,
        userWalletAddress: account,
        internal_id: Number(postCount) + 1 || 0,
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

    // Proceed directly to contract write (which uses IPFS)
    handleContractWrite();
  };

  const handleInsertContent = (content: string) => {
    // If we have selected text, replace only that part
    if (selectedText && editorContent.includes(selectedText)) {
      // Replace the selected text with the new content
      const newContent = editorContent.replace(selectedText, content);
      setEditorContent(newContent);
    } else if (!editorContent.trim()) {
      // If editor is empty, just set the content
      setEditorContent(content);
    } else {
      // Otherwise append to existing content
      setEditorContent((prev) => `${prev}\n\n${content}`);
    }

    // Clear the selected text
    setSelectedText("");
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

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
  };

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

      {/* Top Navbar */}
      <HomeNavbar />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Main Content */}
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Sticky Title Bar */}
            <div className="flex justify-center bg-white border-b border-gray-100 sticky top-0 z-10">
              <div className="w-full max-w-4xl px-8 mt-6">
                <div className="py-4 flex items-center justify-between">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Title..."
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full text-2xl font-bold text-gray-900 border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
                    />
                  </div>
                  <div className="ml-6">
                    <Button
                      onClick={handlePublish}
                      disabled={isPublishing || !title}
                      className="bg-gray-800 hover:bg-gray-900 text-white px-6"
                    >
                      {isPublishing ? (
                        <>
                          <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Publishing...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Publish
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Editor Section */}
            <div className="flex-1 overflow-hidden">
              <div className="h-full flex justify-center">
                <div className="w-full max-w-4xl px-8">
                  <AdvancedEditor
                    initialContent={editorContent}
                    onTextSelection={handleTextSelection}
                    setMarkdownContent={setMarkdownContent}
                    markdownContent={markdownContent}
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
