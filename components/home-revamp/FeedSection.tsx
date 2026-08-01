"use client";

import { X } from "lucide-react";
import { ClapIcon, CommentIcon } from "@/components/icons";
import { FeedSectionProps } from "@/types/home-revamp";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { useEffect, useRef, useState } from "react";
import { getIpfsUrl } from "@/utils/ipfs";

function formatEngagement(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    const s = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1);
    return `${s.replace(/\.0$/, "")}K`;
  }
  return String(n);
}

/** Strip markup for feed excerpt (design: 2 lines of grey body). */
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

  const handleAuthorClick = (e: React.MouseEvent) => {
    if (authorUuid) {
      e.preventDefault();
      e.stopPropagation();
      router.push(`/profile/${authorUuid}`);
    }
  };

  const profilePicUrl =
    getIpfsUrl(post.authorProfilePic) ||
    (typeof post.authorAvatar === "string" &&
    post.authorAvatar.startsWith("http")
      ? post.authorAvatar
      : null);

  // Hard-cap the preview so a long post body can never render in full — the
  // CSS line-clamp is a second line of defense, not the only one.
  const fullExcerpt = excerptPlainText(post.content);
  const excerpt =
    fullExcerpt.length > 160
      ? `${fullExcerpt.slice(0, 160).trimEnd()}…`
      : fullExcerpt;

  const aiRating =
    typeof post.aiRating === "number"
      ? Math.min(100, Math.max(0, Math.round(post.aiRating)))
      : null;

  return (
    <article className="border-b border-border">
      <Link href={`/post/${post.uuid || post.id}`} className="group block py-6">
        <div className="flex items-start justify-between gap-6 md:gap-12">
          <div className="min-w-0 flex-1">
            {/* Publication / author line */}
            <div className="mb-2 flex items-center gap-2">
              {profilePicUrl && !avatarLoadError ? (
                <img
                  src={profilePicUrl}
                  alt=""
                  className="h-5 w-5 shrink-0 rounded-full object-cover"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <span className="h-5 w-5 shrink-0 rounded-full bg-muted" />
              )}
              <span className="truncate text-[13px] text-foreground">
                {authorUuid ? (
                  <button
                    type="button"
                    onClick={handleAuthorClick}
                    className="hover:underline"
                  >
                    {authorName}
                  </button>
                ) : (
                  authorName
                )}
              </span>
              {post.timeAgo && (
                <>
                  <span className="text-muted-foreground">·</span>
                  <span className="shrink-0 text-[13px] text-muted-foreground">
                    {post.timeAgo}
                  </span>
                </>
              )}
            </div>

            <h2 className="text-[18px] font-bold leading-[1.25] tracking-[-0.01em] text-foreground md:text-[20px]">
              {post.title}
            </h2>
            <p className="mt-1.5 line-clamp-2 text-[15px] leading-[1.5] text-muted-foreground">
              {excerpt}
            </p>

            {/* AI rating — the platform's signal, surfaced under every post */}
            <div className="mt-3.5 flex items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                AI
              </span>
              {aiRating !== null ? (
                <>
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{ width: `${aiRating}%` }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-foreground">
                    {aiRating}
                    <span className="font-normal text-muted-foreground">/100</span>
                  </span>
                </>
              ) : (
                <span className="text-[12px] text-muted-foreground">
                  Awaiting AI score
                </span>
              )}
            </div>

            {/* Engagement */}
            <div className="mt-3 flex items-center gap-4 text-[13px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <ClapIcon className="h-[18px] w-[18px] shrink-0" />
                {formatEngagement(clapCount)}
              </span>
              <span className="flex items-center gap-1.5">
                <CommentIcon className="h-[18px] w-[18px] shrink-0" />
                {formatEngagement(commentCount)}
              </span>
            </div>
          </div>

          {post.imageUrl && (
            <div className="shrink-0">
              <img
                src={post.imageUrl}
                alt=""
                className="h-[80px] w-[112px] object-cover md:h-[112px] md:w-[160px]"
              />
            </div>
          )}
        </div>
      </Link>
    </article>
  );
};

const RowSkeleton = () => (
  <div className="flex items-start justify-between gap-12 border-b border-border py-6">
    <div className="min-w-0 flex-1">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-5 w-5 shimmer rounded-full bg-muted" />
        <div className="h-3 w-28 shimmer rounded bg-muted" />
      </div>
      <div className="mb-2 h-4 w-3/4 shimmer rounded bg-muted" />
      <div className="mb-1 h-3.5 w-full shimmer rounded bg-muted" />
      <div className="h-3.5 w-1/2 shimmer rounded bg-muted" />
    </div>
    <div className="h-[112px] w-[160px] shrink-0 shimmer bg-muted" />
  </div>
);

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

  return (
    <div>
      {selectedTag && (
        <div className="mb-2 flex items-center gap-2">
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
              className="ml-1 rounded-full p-1 transition-colors duration-150 hover:bg-muted"
              aria-label="Clear tag filter"
            >
              <X className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </div>
      )}

      {isLoading ? (
        <div>
          {Array.from({ length: 5 }).map((_, index) => (
            <RowSkeleton key={index} />
          ))}
        </div>
      ) : posts.length > 0 ? (
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
            <div className="px-6 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                You&apos;ve reached the end
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="px-6 py-14 text-center">
          <p className="text-lg text-muted-foreground">No posts available</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Be the first to create a post!
          </p>
        </div>
      )}
    </div>
  );
};
