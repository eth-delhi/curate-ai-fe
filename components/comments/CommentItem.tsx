"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, ThumbsUp, Edit, Trash2, Reply, Send, X, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAccount } from "wagmi";
import {
  CommentDto,
  useUpdateComment,
  useDeleteComment,
} from "@/hooks/api/comments";
import { ConfirmDeleteModal } from "@/components/ui/ConfirmDeleteModal";
import { showToast } from "@/utils/showToast";

interface CommentItemProps {
  comment: CommentDto;
  postUuid: string;
  onReply: (parentCommentUuid: string) => void;
  replyingTo?: string | undefined;
  onCancelReply: () => void;
}

export const CommentItem: React.FC<CommentItemProps> = ({
  comment,
  postUuid,
  onReply,
  replyingTo,
  onCancelReply,
}) => {
  const { address: userAddress } = useAccount();
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isReplying, setIsReplying] = useState(false);
  const [replyContent, setReplyContent] = useState("");
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
      console.error("Failed to update comment:", error);
      showToast({
        message: "Failed to update comment. Please try again.",
        type: "error",
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCommentMutation.mutateAsync(comment.uuid);
      setShowDeleteModal(false);
    } catch (error) {
      console.error("Failed to delete comment:", error);
      showToast({
        message: "Failed to delete comment. Please try again.",
        type: "error",
      });
    }
  };

  const openDeleteModal = () => {
    setShowDeleteModal(true);
  };

  const handleReply = () => {
    if (!replyContent.trim()) return;
    onReply(comment.uuid);
    setReplyContent("");
    setIsReplying(false);
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="border-b border-border pb-6 last:border-0">
      <div className="mb-2 flex items-start gap-3">
        <Avatar className="h-8 w-8 border border-border">
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback className="bg-muted text-muted-foreground">
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="mb-1 flex items-center gap-2">
            <p className="text-[14px] font-medium text-foreground">
              {formatWalletAddress(comment.userWalletAddress)}
            </p>
            {isOwner && (
              <Badge
                variant="secondary"
                className="border border-border bg-muted text-[11px] text-muted-foreground"
              >
                You
              </Badge>
            )}
          </div>
          <p className="text-[12px] text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
            {comment.updatedAt !== comment.createdAt && " (edited)"}
          </p>
        </div>
      </div>

      <div className="ml-11">
        {isEditing ? (
          <div className="mb-3">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="mb-2 min-h-[90px] rounded-xl border-input bg-background text-[14px] leading-[1.6] text-foreground focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Edit your comment..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={
                  updateCommentMutation.isPending || !editContent.trim()
                }
                className="rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
              >
                {updateCommentMutation.isPending ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Send className="h-3 w-3 mr-1" />
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
                className="rounded-full border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="mb-3 text-[15px] leading-[1.65] text-foreground">
            {comment.content}
          </p>
        )}

        <div className="flex items-center gap-4">
          <button className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors duration-150 hover:text-foreground">
            <ThumbsUp className="h-3 w-3" />
            <span>0</span>
          </button>

          <button
            onClick={() => setIsReplying(!isReplying)}
            className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>

          {isOwner && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={openDeleteModal}
                disabled={deleteCommentMutation.isPending}
                className="flex items-center gap-1 text-[12px] text-muted-foreground transition-colors duration-150 hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </>
          )}
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="mt-4 ml-4 border-l-2 border-border pl-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2 min-h-[90px] rounded-xl border-input bg-background text-[14px] leading-[1.6] text-foreground focus-visible:ring-1 focus-visible:ring-ring"
              placeholder="Write a reply..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="rounded-full bg-primary text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
              >
                <Send className="h-3 w-3 mr-1" />
                Reply
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setIsReplying(false);
                  setReplyContent("");
                }}
                className="rounded-full border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="mt-4 space-y-4">
            {comment.replies.map((reply) => (
              <div
                key={reply.uuid}
                className="ml-4 border-l-2 border-border pl-4"
              >
                <div className="mb-2 flex items-start gap-3">
                  <Avatar className="h-6 w-6 border border-border">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <p className="text-[13px] font-medium text-foreground">
                        {formatWalletAddress(reply.userWalletAddress)}
                      </p>
                      {userAddress?.toLowerCase() ===
                        reply.userWalletAddress.toLowerCase() && (
                        <Badge
                          variant="secondary"
                          className="border border-border bg-muted text-[11px] text-muted-foreground"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-[12px] text-muted-foreground">
                      {formatDistanceToNow(new Date(reply.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="ml-9">
                  <p className="text-[14px] leading-[1.65] text-foreground">
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
