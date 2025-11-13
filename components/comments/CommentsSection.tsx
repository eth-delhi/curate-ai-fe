"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { User, MessageSquare, Send, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useComments, useCreateComment } from "@/hooks/api/comments";
import { CommentItem } from "./CommentItem";
import { CommentDto } from "@/utils/types";
import { showToast } from "@/utils/showToast";
import { useAuth } from "@/hooks/useAuth";

interface CommentsSectionProps {
  postUuid: string;
  comments?: CommentDto[];
}

export const CommentsSection: React.FC<CommentsSectionProps> = ({
  postUuid,
  comments = [],
}) => {
  const { address: userAddress } = useAccount();
  const { isAuthenticated } = useAuth();
  const [newComment, setNewComment] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | undefined>(undefined);

  const { data: commentsData } = useComments(comments);
  const createCommentMutation = useCreateComment(postUuid);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      await createCommentMutation.mutateAsync({
        postUuid,
        content: newComment,
        parentCommentUuid: replyingTo || undefined,
      });
      setNewComment("");
      setReplyingTo(undefined);
      showToast({
        message: replyingTo
          ? "Reply posted successfully"
          : "Comment posted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to create comment:", error);
      showToast({
        message: "Failed to post comment. Please try again.",
        type: "error",
      });
    }
  };

  const handleReply = async (parentCommentUuid: string) => {
    if (!newComment.trim() || !isAuthenticated) return;

    try {
      await createCommentMutation.mutateAsync({
        postUuid,
        content: newComment,
        parentCommentUuid,
      });
      setNewComment("");
      setReplyingTo(undefined);
      showToast({
        message: "Reply posted successfully",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to create reply:", error);
      showToast({
        message: "Failed to post reply. Please try again.",
        type: "error",
      });
    }
  };

  const handleReplyClick = (parentCommentUuid: string) => {
    setReplyingTo(parentCommentUuid);
  };

  const handleCancelReply = () => {
    setReplyingTo(undefined);
  };

  const formatWalletAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const topLevelComments =
    commentsData?.filter((comment) => !comment.parentCommentUuid) || [];

  return (
    <div className="bg-white p-6">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Comments ({commentsData?.length || 0})
      </h2>

      {/* Comment Form */}
      <div className="mb-8">
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <div className="flex gap-3 mb-3">
              <Avatar className="h-10 w-10 border border-gray-200">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <p className="text-sm font-medium text-gray-900">
                    {userAddress
                      ? formatWalletAddress(userAddress)
                      : "Anonymous User"}
                  </p>
                  <Badge
                    variant="secondary"
                    className="text-xs bg-gray-100 text-gray-600"
                  >
                    You
                  </Badge>
                </div>
                <Textarea
                  placeholder={
                    replyingTo ? "Write a reply..." : "Add a comment..."
                  }
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="min-h-[100px] border-gray-200 focus:border-gray-300 focus:ring focus:ring-gray-100 focus:ring-opacity-50 bg-gray-50"
                />
              </div>
            </div>

            {replyingTo && (
              <div className="mb-3 ml-13">
                <Badge variant="outline" className="text-xs border-gray-200">
                  Replying to comment
                </Badge>
                <button
                  type="button"
                  onClick={handleCancelReply}
                  className="ml-2 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || createCommentMutation.isPending}
                className="bg-gray-800 hover:bg-gray-900 text-white"
              >
                {createCommentMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Send className="h-4 w-4 mr-2" />
                )}
                {replyingTo ? "Post Reply" : "Post Comment"}
              </Button>
            </div>
          </form>
        ) : (
          <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
            <p className="text-gray-600 text-center text-sm">
              Please log in to leave a comment.
            </p>
          </div>
        )}
      </div>

      {/* Comments List */}
      {topLevelComments.length > 0 ? (
        <div className="space-y-6">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.uuid}
              comment={comment}
              postUuid={postUuid}
              onReply={handleReplyClick}
              replyingTo={replyingTo}
              onCancelReply={handleCancelReply}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No comments yet
          </h3>
          <p className="text-gray-500">
            Be the first to share your thoughts on this post
          </p>
        </div>
      )}
    </div>
  );
};
