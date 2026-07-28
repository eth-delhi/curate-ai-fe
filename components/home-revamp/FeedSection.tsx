"use client";

import {
  Bookmark,
  MessageCircle,
  X,
  MoreHorizontal,
} from "lucide-react";
import { PiHandsClappingThin } from "react-icons/pi";
import { FeedSectionProps } from "@/types/home-revamp";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { getIpfsUrl } from "@/utils/ipfs";
import { AnimatePresence, motion } from "framer-motion";

function formatEngagement(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    const s = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1);
    return `${s.replace(/\.0$/, "")}K`;
  }
  return String(n);
}

/** Strip markup for feed excerpt (design: 2–3 lines of grey body). */
function excerptPlainText(htmlOrText: string | undefined): string {
  if (!htmlOrText) return "";
  return htmlOrText
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const FeedPostCard = ({ post }: { post: any }) => {
  const router = useRouter();
  const [avatarLoadError, setAvatarLoadError] = useState(false);

  const authorName = post.authorFullName || post.author || "Anonymous";
  const authorUuid = post.authorUuid;

  const clapCount = post.clapCount ?? 0;
  const commentCount = post.commentCount ?? 0;
  const tags =
    post.tags && post.tags.length > 0
      ? post.tags.map((tag: string) => (tag.startsWith("#") ? tag : `#${tag}`))
      : [];

  const handleAuthorClick = (e: React.MouseEvent) => {
    if (authorUuid) {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/profile/${authorUuid}`);
    }
  };

  const gradientClass = "bg-muted";

  const profilePicUrl =
    getIpfsUrl(post.authorProfilePic) ||
    (typeof post.authorAvatar === "string" && post.authorAvatar.startsWith("http")
      ? post.authorAvatar
      : null);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="group mb-3 overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <Link href={`/post/${post.uuid || post.id}`}>
        <div className="p-4 pb-3">
          <div className="mb-3 flex items-start gap-2.5">
            {profilePicUrl && !avatarLoadError ? (
              <img
                src={profilePicUrl}
                alt={authorName}
                className="h-12 w-12 shrink-0 rounded-full object-cover"
                onError={() => setAvatarLoadError(true)}
              />
            ) : (
              <span
                className={`h-12 w-12 shrink-0 rounded-full ${gradientClass}`}
              />
            )}
            <div className="min-w-0 flex-1">
              <div className="text-[15px] font-semibold text-foreground">
                {authorUuid ? (
                  <button
                    type="button"
                    onClick={handleAuthorClick}
                    className="font-semibold text-foreground hover:underline"
                  >
                    {authorName}
                  </button>
                ) : (
                  <span>{authorName}</span>
                )}
              </div>
              <div className="text-[13px] text-muted-foreground">
                {post.readTime || "3 min read"} · {post.timeAgo || "Recently"}
              </div>
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label="More"
              className="shrink-0 rounded-full p-1.5 text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          </div>

          <h3 className="mb-1.5 text-[16px] font-semibold leading-snug text-foreground">
            {post.title}
          </h3>
          <p className="mb-2 line-clamp-3 text-[14px] leading-relaxed text-muted-foreground">
            {excerptPlainText(post.content)}
          </p>

          {typeof post.aiRating === "number" && (
            <div
              className="mb-1 h-1 w-16 rounded-full bg-muted overflow-hidden"
              title={`AI rating: ${post.aiRating}/100`}
            >
              <motion.div
                className="h-full rounded-full bg-primary/60"
                initial={{ width: 0 }}
                whileInView={{
                  width: `${Math.min(100, Math.max(0, post.aiRating))}%`,
                }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
              />
            </div>
          )}

          {tags.length > 0 && (
            <span className="inline-block text-[13px] text-primary">
              {tags[0]}
            </span>
          )}
        </div>

        {post.imageUrl && (
          <div className="w-full overflow-hidden bg-muted">
            <img
              src={post.imageUrl}
              alt=""
              className="max-h-[420px] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          </div>
        )}
      </Link>

      <div className="flex items-center justify-between px-4 pt-2.5 text-[13px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <PiHandsClappingThin className="h-4 w-4 shrink-0" />
          {formatEngagement(clapCount)}
        </span>
        <span>{commentCount} comments</span>
      </div>

      <div className="mt-1 flex items-center border-t border-border px-1">
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-[14px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <PiHandsClappingThin className="h-5 w-5" />
          Applaud
        </motion.button>
        <Link
          href={`/post/${post.uuid || post.id}`}
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-[14px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <MessageCircle className="h-5 w-5" />
          Comment
        </Link>
        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          aria-label="Bookmark"
          className="flex flex-1 items-center justify-center gap-2 py-2.5 text-[14px] font-medium text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <Bookmark className="h-5 w-5" />
          Save
        </motion.button>
      </div>
    </motion.article>
  );
};

export const FeedSection = ({
  posts,
  isLoading,
  selectedTag,
  onClearTagFilter,
  hasNextPage,
  isFetchingNextPage,
  onLoadMore,
}: FeedSectionProps) => {
  const observerTarget = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasNextPage &&
          !isFetchingNextPage &&
          onLoadMore
        ) {
          onLoadMore();
        }
      },
      {
        threshold: 0.1,
        rootMargin: "100px",
      }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  if (isLoading) {
    return (
      <div>
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="mb-3 rounded-xl border border-border bg-background p-4 shadow-sm"
          >
            <div className="mb-3 flex gap-2.5">
              <div className="h-12 w-12 shimmer rounded-full bg-muted" />
              <div className="flex-1 space-y-2 pt-1">
                <div className="h-3.5 w-32 shimmer rounded bg-muted" />
                <div className="h-3 w-24 shimmer rounded bg-muted" />
              </div>
            </div>
            <div className="mb-2 h-4 w-3/4 shimmer rounded bg-muted" />
            <div className="mb-1 h-3.5 w-full shimmer rounded bg-muted" />
            <div className="h-3.5 w-2/3 shimmer rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <AnimatePresence>
        {selectedTag && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-3 overflow-hidden rounded-xl border border-border bg-background p-3 shadow-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Filtered by:</span>
              <Badge
                variant="secondary"
                className="bg-muted px-3 py-1 text-sm font-medium text-foreground"
              >
                #{selectedTag}
              </Badge>
              {onClearTagFilter && (
                <button
                  type="button"
                  onClick={onClearTagFilter}
                  className="ml-2 rounded p-1 transition-colors duration-150 hover:bg-accent"
                  aria-label="Clear tag filter"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div>
        {posts.length > 0 ? (
          <>
            {posts.map((post, index) => (
              <FeedPostCard key={post.id || post.uuid || index} post={post} />
            ))}
            {hasNextPage && (
              <div
                ref={observerTarget}
                className="flex h-20 items-center justify-center"
              >
                {isFetchingNextPage && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <div className="h-5 w-5 animate-spin rounded-full border-2 border-border border-t-foreground" />
                    <span className="text-sm">Loading more posts...</span>
                  </div>
                )}
              </div>
            )}
            {!hasNextPage && posts.length > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="px-6 py-8 text-center"
              >
                <p className="text-sm text-muted-foreground">You&apos;ve reached the end</p>
              </motion.div>
            )}
          </>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border bg-background px-6 py-12 text-center shadow-sm"
          >
            <p className="text-lg text-muted-foreground">No posts available</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to create a post!
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
};
