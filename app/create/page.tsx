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

// Import modular components
import CreateLayout from "@/components/create/CreateLayout";
import CreateHeader from "@/components/create/CreateHeader";
import EditorSection from "@/components/create/EditorSection";
import ActionButtons from "@/components/create/ActionButtons";

export default function CreatePostPage() {
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [editorContent, setEditorContent] = useState("");
  const [isAssistantCollapsed, setIsAssistantCollapsed] = useState(false);
  const [selectedText, setSelectedText] = useState("");
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [coverImage, setCoverImage] = useState("");
  const [markdownContent, setMarkdownContent] = useState("");
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const router = useRouter();
  const { address: account } = useAccount();

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
    setIsConfirmOpen(true);
  };

  // todo: post count might be wrong, because someone might post after it is fetched
  const { data: postCount } = useReadCurateAiPostsPostCounter({
    address: contract.post as `0x${string}`,
  });

  console.log("postCount", postCount?.toString());

  console.log("account", account);

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
        router.push(`/post/${postResponse.uuid}`);
      } else {
        console.error("No UUID returned from post creation");
        router.push("/home");
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

  return (
    <CreateLayout>
      <CreateHeader
        title={title}
        setTitle={setTitle}
        tags={tags}
        setTags={setTags}
        tagInput={tagInput}
        setTagInput={setTagInput}
      />

      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        <EditorSection
          editorContent={editorContent}
          setEditorContent={setEditorContent}
          markdownContent={markdownContent}
          setMarkdownContent={setMarkdownContent}
          selectedText={selectedText}
          setSelectedText={setSelectedText}
          isAssistantCollapsed={isAssistantCollapsed}
          setIsAssistantCollapsed={setIsAssistantCollapsed}
          onInsertContent={handleInsertContent}
        />
      </div>

      <ActionButtons
        isPublishing={isPublishing}
        title={title}
        onPublish={handlePublish}
      />

      <ConfirmActionModal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={confirmAction}
        actionText="Publish Story"
      />
    </CreateLayout>
  );
}
