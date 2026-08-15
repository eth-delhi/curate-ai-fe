"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Edit, Trash2, Send, X, Loader2 } from "lucide-react";
import { UpvoteIcon } from "@/components/icons";
import { formatDistanceToNow } from "date-fns";
import { useAccount } from "wagmi";
import {
  CommentDto,
  useUpdateComment,
  useDeleteComment,
} from "@/hooks/api/comments";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";

interface CommentItemProps {
  comment: CommentDto;
  postUuid: string;
}

// Small "You" tag used on the current user's own comments/replies.
const OwnerTag = () => (
  <span className="border border-[#0A0A0A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#0A0A0A]">
    You
  </span>
);

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postUuid,
}) => {
  const { address: userAddress } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const updateCommentMutation = useUpdateComment(postUuid);
  const deleteCommentMutation = useDeleteComment(postUuid);

  const isOwner =
    userAddress?.toLowerCase() === comment.userWalletAddress.toLowerCase();

  const handleEdit = async () => {
    if (!editContent.trim()) return;
    try {
      await updateCommentMutation.mutateAsync({
        uuid: comment.uuid,
        data: { content: editContent },
      });
      setIsEditing(false);
    } catch (error) {
      // No toast on this page — leave the editor open so the user can retry.
      console.error("Failed to update comment:", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCommentMutation.mutateAsync(comment.uuid);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const formatWalletAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="border-b border-[color:var(--border)] py-5">
      <div className="mb-2 flex items-start gap-3">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback className="bg-[#0A0A0A]/10 text-[#0A0A0A]">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0A0A0A]">
              {formatWalletAddress(comment.userWalletAddress)}
            </p>
            {isOwner && <OwnerTag />}
          </div>
          <p className="text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A]/45">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
            {comment.updatedAt !== comment.createdAt && " · edited"}
          </p>
        </div>
      </div>

      <div className="ml-11">
        {isEditing ? (
          <div className="mb-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="mb-2 min-h-[90px] rounded-none border border-[#0A0A0A]/40 bg-transparent text-[14px] leading-[1.6] text-[#0A0A0A] focus-visible:border-[#0A0A0A] focus-visible:ring-0"
              placeholder="Edit your comment…"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={
                  updateCommentMutation.isPending || !editContent.trim()
                }
                className="rounded-none border border-[#0A0A0A] bg-[#0A0A0A] text-[10px] font-bold uppercase tracking-[0.14em] text-[#F5F4F0] transition-colors duration-150 hover:bg-[#F5F4F0] hover:text-[#0A0A0A]"
              >
                {updateCommentMutation.isPending ? (
                  <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                ) : (
                  <Send className="mr-1 h-3 w-3" />
                )}
                Save
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(comment.content);
                }}
                className="rounded-none border border-[#0A0A0A] bg-transparent text-[10px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A] transition-colors duration-150 hover:bg-[#0A0A0A] hover:text-[#F5F4F0]"
              >
                <X className="mr-1 h-3 w-3" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mb-3 text-[15px] leading-[1.65] text-[#0A0A0A]/85">
            {comment.content}
          </p>
        )}

        <div className="flex items-center gap-4 text-[10px] font-medium uppercase tracking-[0.12em] text-[#0A0A0A]/55">
          <button className="flex items-center gap-1.5 transition-colors duration-150 hover:text-[#0A0A0A]">
            <UpvoteIcon className="h-3.5 w-3.5" />
            <span>0</span>
          </button>

          {isOwner && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1.5 transition-colors duration-150 hover:text-[#0A0A0A]"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                disabled={deleteCommentMutation.isPending}
                className="flex items-center gap-1.5 transition-colors duration-150 hover:text-[#0A0A0A]"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </>
          )}
        </div>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-5 space-y-5">
            {comment.replies.map((reply) => (
              <div
                key={reply.uuid}
                className="ml-1 border-l border-[color:var(--border)] pl-4"
              >
                <div className="mb-2 flex items-start gap-3">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback className="bg-[#0A0A0A]/10 text-[#0A0A0A]">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0A0A0A]">
                        {formatWalletAddress(reply.userWalletAddress)}
                      </p>
                      {userAddress?.toLowerCase() ===
                        reply.userWalletAddress.toLowerCase() && <OwnerTag />}
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A]/45">
                      {formatDistanceToNow(new Date(reply.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="ml-9">
                  <p className="text-[14px] leading-[1.65] text-[#0A0A0A]/85">
                    {reply.content}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDelete}
        title="Delete Comment"
        message="Are you sure you want to delete this comment? This action cannot be undone."
        confirmText="Delete Comment"
        cancelText="Cancel"
        isLoading={deleteCommentMutation.isPending}
      />
    </div>
  );
};
