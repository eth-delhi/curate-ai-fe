"use client";

import React, { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { User, Send, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useComments, useCreateComment } from "@/hooks/api/comments";
import { CommentItem } from "./CommentItem";
import { CommentDto } from "@/utils/types";
import { useAuth } from "@/hooks/useAuth";
import { display } from "@/components/brutal";

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
  const [submitFailed, setSubmitFailed] = useState(false);

  const { data: commentsData } = useComments(comments);
  const createCommentMutation = useCreateComment(postUuid);

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setSubmitFailed(false);
    try {
      await createCommentMutation.mutateAsync({ postUuid, content: newComment });
      setNewComment("");
      // The new comment appears in the thread immediately once the query
      // invalidates — no toast needed.
    } catch (error) {
      console.error("Failed to create comment:", error);
      setSubmitFailed(true); // inline notice — no toast on this page
    }
  };

  const formatWalletAddress = (address: string) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  const topLevelComments =
    commentsData?.filter((comment) => !comment.parentCommentUuid) || [];

  return (
    <div className="bg-background">
      <h2 className={`${display} mb-6 text-lg font-black uppercase tracking-tight text-[#0A0A0A]`}>
        Comments ({commentsData?.length || 0})
      </h2>

      {/* Comment form */}
      <div className="mb-10">
        {isAuthenticated ? (
          <form onSubmit={handleCommentSubmit}>
            <div className="mb-3 flex gap-3">
              <Avatar className="h-9 w-9 border border-[#0A0A0A]">
                <AvatarImage src="/placeholder.svg" alt="User" />
                <AvatarFallback className="bg-[#0A0A0A]/10 text-[#0A0A0A]">
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="mb-2 flex items-center gap-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#0A0A0A]">
                    {userAddress
                      ? formatWalletAddress(userAddress)
                      : "Anonymous User"}
                  </p>
                  <span className="border border-[#0A0A0A] px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-[0.12em] text-[#0A0A0A]">
                    You
                  </span>
                </div>
                <Textarea
                  placeholder="Add a comment…"
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    if (submitFailed) setSubmitFailed(false);
                  }}
                  className="min-h-[110px] rounded-none border border-[#0A0A0A]/40 bg-transparent text-[15px] leading-[1.6] text-[#0A0A0A] placeholder:text-[#0A0A0A]/40 focus-visible:border-[#0A0A0A] focus-visible:ring-0"
                />
                {submitFailed && (
                  <p className="mt-2 text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/60">
                    Couldn&apos;t post — try again
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end">
              <Button
                type="submit"
                disabled={!newComment.trim() || createCommentMutation.isPending}
                className="rounded-none border border-[#0A0A0A] bg-[#0A0A0A] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F5F4F0] transition-colors duration-150 hover:bg-[#F5F4F0] hover:text-[#0A0A0A]"
              >
                {createCommentMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Post Comment
              </Button>
            </div>
          </form>
        ) : (
          <div className="border border-[#0A0A0A]/40 px-4 py-4">
            <p className="text-center text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A]/55">
              Please log in to leave a comment
            </p>
          </div>
        )}
      </div>

      {/* Comments list */}
      {topLevelComments.length > 0 ? (
        <div className="border-t border-[color:var(--border)]">
          {topLevelComments.map((comment) => (
            <CommentItem
              key={comment.uuid}
              comment={comment}
              postUuid={postUuid}
            />
          ))}
        </div>
      ) : (
        <div className="py-12 text-center">
          <p className={`${display} text-lg font-black uppercase tracking-tight text-[#0A0A0A]`}>
            No comments yet
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A]/45">
            Be the first to share your thoughts
          </p>
        </div>
      )}
    </div>
  );
};
