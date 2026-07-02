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
    <div className="bg-background px-1 py-1">
      <h2 className="mb-6 text-[20px] font-semibold text-foreground">
        Comments ({commentsData?.length || 0})
      </h2>

      {/* Comment Form */}
      <div className="mb-8">
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <div className="mb-3 flex gap-3">
              <Avatar className="h-10 w-10 border border-border">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-muted text-muted-foreground">
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-[14px] font-medium text-foreground">
                    {userAddress
                      ? formatWalletAddress(userAddress)
                      : "Anonymous User"}
                  </p>
                  <Badge
                    variant="secondary"
                    className="border border-border bg-muted text-[11px] text-muted-foreground"
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
                  className="min-h-[110px] rounded-xl border-input bg-background text-[15px] leading-[1.6] text-foreground placeholder:text-muted-foreground focus-visible:ring-1 focus-visible:ring-ring"
                />
              </div>
            </div>

            {replyingTo && (
              <div className="mb-3 ml-13">
                <Badge
                  variant="outline"
                  className="border-border text-[11px] text-muted-foreground"
                >
                  Replying to comment
                </Badge>
                <button
                  type="button"
                  onClick={handleCancelReply}
                  className="ml-2 text-[12px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || createCommentMutation.isPending}
                className="rounded-full bg-primary px-5 text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
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
          <div className="rounded-xl border border-border bg-muted p-4">
            <p className="text-center text-[14px] text-muted-foreground">
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
          <MessageSquare className="mx-auto mb-3 h-12 w-12 text-muted-foreground" />
          <h3 className="mb-1 text-[18px] font-medium text-foreground">
            No comments yet
          </h3>
          <p className="text-[14px] text-muted-foreground">
            Be the first to share your thoughts on this post
          </p>
        </div>
      )}
    </div>
  );
};
