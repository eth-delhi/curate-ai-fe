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

const tabActiveBar =
  "pointer-events-none absolute bottom-0 left-0 right-0 h-[3px] bg-primary";

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
    <Link href={`/post/${post.uuid || post.id}`}>
      <article className="border-b border-border py-8">
        <div className="mb-3 flex items-center gap-2.5">
          {profilePicUrl && !avatarLoadError ? (
            <img
              src={profilePicUrl}
              alt={authorName}
              className="h-7 w-7 shrink-0 rounded-full object-cover"
              onError={() => setAvatarLoadError(true)}
            />
          ) : (
            <span
              className={`h-7 w-7 shrink-0 rounded-full ${gradientClass}`}
            />
          )}
          <span className="text-[15px] font-medium text-foreground">
            {authorUuid ? (
              <button
                type="button"
                onClick={handleAuthorClick}
                className="font-medium text-foreground hover:underline"
              >
                {authorName}
              </button>
            ) : (
              <span>{authorName}</span>
            )}
          </span>
          <span className="text-[15px] text-muted-foreground">
            · {post.timeAgo || "Recently"}
          </span>
        </div>

        <div className="flex gap-8">
          <div className="min-w-0 flex-1">
            <h3 className="mb-2 font-serif text-[26px] font-bold leading-[1.25] tracking-tight text-foreground">
              {post.title}
            </h3>
            <p className="mb-3 line-clamp-3 text-[17px] leading-[1.55] text-muted-foreground">
              {excerptPlainText(post.content)}
            </p>
            {typeof post.aiRating === "number" && (
              <div
                className="mb-3 h-1 w-16 rounded-full bg-muted overflow-hidden"
                title={`AI rating: ${post.aiRating}/100`}
              >
                <div
                  className="h-full rounded-full bg-primary/60"
                  style={{ width: `${Math.min(100, Math.max(0, post.aiRating))}%` }}
                />
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="whitespace-nowrap rounded-2xl bg-muted px-[11px] py-1.5 text-[14px] text-foreground">
                  {(tags[0] || "#General").replace("#", "")}
                </span>
                <span className="whitespace-nowrap text-[14px] text-muted-foreground">
                  {post.readTime || "3 min read"}
                </span>
                <div className="flex items-center gap-4 text-[14px] text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <PiHandsClappingThin className="h-5 w-5 shrink-0" />
                    {formatEngagement(clapCount)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-5 w-5 shrink-0" />
                    {commentCount}
                  </span>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-5 text-muted-foreground">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  aria-label="Bookmark"
                  className="hover:text-foreground transition-colors duration-150"
                >
                  <Bookmark className="h-6 w-6" />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  aria-label="More"
                  className="text-lg hover:text-foreground transition-colors duration-150"
                >
                  <MoreHorizontal className="h-6 w-6" />
                </button>
              </div>
            </div>
          </div>
          {post.imageUrl ? (
          <div className="h-[118px] w-44 shrink-0 overflow-hidden rounded-md">
            <img
              src={post.imageUrl}
              alt=""
              className="h-full w-full object-cover"
            />
          </div>
          ) : null}
        </div>
      </article>
    </Link>
  );
};

export const FeedSection = ({
  posts,
  activeTab,
  onTabChange,
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
            className="animate-pulse border-b border-border py-8"
          >
            <div className="mb-3 flex gap-2">
              <div className="h-5 w-5 rounded bg-muted" />
              <div className="h-4 w-48 rounded bg-muted" />
            </div>
            <div className="mb-3 h-7 w-3/4 rounded bg-muted" />
            <div className="mb-2 h-4 w-full rounded bg-muted" />
            <div className="h-4 w-2/3 rounded bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <div className="mb-10 flex gap-10 border-b border-border">
        <button
          type="button"
          onClick={() => onTabChange("new")}
          className={`relative flex items-center gap-2 py-5 text-[16px] font-medium leading-snug transition-colors duration-150 ${
            activeTab === "new"
              ? "text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          <span className="text-[20px] font-normal leading-none">+</span>
          For you
          {activeTab === "new" && <span className={tabActiveBar} />}
        </button>
        <button
          type="button"
          onClick={() => onTabChange("following")}
          className={`relative py-5 text-[16px] font-medium leading-snug transition-colors duration-150 ${
            activeTab === "following"
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Following
          {activeTab === "following" && <span className={tabActiveBar} />}
        </button>
        <button
          type="button"
          onClick={() => onTabChange("hot")}
          className={`relative py-5 text-[16px] font-medium leading-snug transition-colors duration-150 ${
            activeTab === "hot"
              ? "text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Hot
          {activeTab === "hot" && <span className={tabActiveBar} />}
        </button>
      </div>

      {selectedTag && (
        <div className="mb-4 border-b border-border pb-3">
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
        </div>
      )}

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
              <div className="px-6 py-8 text-center">
                <p className="text-sm text-muted-foreground">You&apos;ve reached the end</p>
              </div>
            )}
          </>
        ) : (
          <div className="px-6 py-12 text-center">
            <p className="text-lg text-muted-foreground">No posts available</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Be the first to create a post!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
