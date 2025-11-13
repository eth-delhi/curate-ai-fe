"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  User,
  ThumbsUp,
  MessageSquare,
  Edit,
  Trash2,
  Reply,
  Send,
  X,
  Loader2,
} from "lucide-react";
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
      showToast({
        message: "Comment updated successfully",
        type: "success",
      });
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
      showToast({
        message: "Comment deleted successfully",
        type: "success",
      });
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
    <div className="border-b border-gray-100 pb-6 last:border-0">
      <div className="flex items-start gap-3 mb-2">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/placeholder.svg" alt="User" />
          <AvatarFallback>
            <User className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <p className="font-medium text-gray-900">
              {formatWalletAddress(comment.userWalletAddress)}
            </p>
            {isOwner && (
              <Badge
                variant="secondary"
                className="text-xs bg-gray-100 text-gray-600"
              >
                You
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-500">
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
              className="mb-2 min-h-[80px] border-gray-200 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 bg-gray-50"
              placeholder="Edit your comment..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleEdit}
                disabled={
                  updateCommentMutation.isPending || !editContent.trim()
                }
                className="bg-gray-800 hover:bg-gray-900 text-white"
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
                className="border-gray-200 hover:bg-gray-50"
              >
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-gray-700 text-sm mb-3">{comment.content}</p>
        )}

        <div className="flex items-center gap-4">
          <button className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors">
            <ThumbsUp className="h-3 w-3" />
            <span>0</span>
          </button>

          <button
            onClick={() => setIsReplying(!isReplying)}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
          >
            <Reply className="h-3 w-3" />
            Reply
          </button>

          {isOwner && !isEditing && (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                <Edit className="h-3 w-3" />
                Edit
              </button>
              <button
                onClick={openDeleteModal}
                disabled={deleteCommentMutation.isPending}
                className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1 transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </>
          )}
        </div>

        {/* Reply form */}
        {isReplying && (
          <div className="mt-4 ml-4 border-l-2 border-gray-200 pl-4">
            <Textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              className="mb-2 min-h-[80px] border-gray-200 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 bg-gray-50"
              placeholder="Write a reply..."
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleReply}
                disabled={!replyContent.trim()}
                className="bg-gray-800 hover:bg-gray-900 text-white"
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
                className="border-gray-200 hover:bg-gray-50"
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
                className="ml-4 border-l-2 border-gray-200 pl-4"
              >
                <div className="flex items-start gap-3 mb-2">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src="/placeholder.svg" alt="User" />
                    <AvatarFallback>
                      <User className="h-3 w-3" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-medium text-gray-900 text-sm">
                        {formatWalletAddress(reply.userWalletAddress)}
                      </p>
                      {userAddress?.toLowerCase() ===
                        reply.userWalletAddress.toLowerCase() && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-gray-100 text-gray-600"
                        >
                          You
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(reply.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
                <div className="ml-9">
                  <p className="text-gray-700 text-sm">{reply.content}</p>
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
