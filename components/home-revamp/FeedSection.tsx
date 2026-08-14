"use client";

import { X } from "lucide-react";
import { ClapIcon, CommentIcon } from "@/components/icons";
import { FeedSectionProps } from "@/types/home-revamp";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { getIpfsUrl } from "@/utils/ipfs";
import { display, EXPO } from "@/components/brutal";

function formatEngagement(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    const s = k % 1 === 0 ? k.toFixed(0) : k.toFixed(1);
    return `${s.replace(/\.0$/, "")}K`;
  }
  return String(n);
}

/** Strip markup for feed excerpt (design: 2 lines of muted body). */
function excerptPlainText(htmlOrText: string | undefined): string {
  if (!htmlOrText) return "";
  return htmlOrText
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export const FeedPostCard = ({ post, index = 0 }: { post: any; index?: number }) => {
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
    fullExcerpt.length > 170
      ? `${fullExcerpt.slice(0, 170).trimEnd()}…`
      : fullExcerpt;

  const aiRating =
    typeof post.aiRating === "number"
      ? Math.min(100, Math.max(0, Math.round(post.aiRating)))
      : null;

  return (
    <motion.article
      className="border-b border-[color:var(--border)]"
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.5, ease: EXPO, delay: Math.min(index, 6) * 0.06 }}
    >
      <Link href={`/post/${post.uuid || post.id}`} className="group block py-9">
        <div className="flex items-start justify-between gap-6 md:gap-12">
          <div className="min-w-0 flex-1">
            {/* Author row */}
            <div className="mb-4 flex items-center gap-2.5">
              {profilePicUrl && !avatarLoadError ? (
                <img
                  src={profilePicUrl}
                  alt=""
                  className="h-6 w-6 shrink-0 rounded-full object-cover"
                  onError={() => setAvatarLoadError(true)}
                />
              ) : (
                <span className="h-6 w-6 shrink-0 rounded-full bg-[#0A0A0A]/10" />
              )}
              <span className="truncate text-[11px] font-bold uppercase tracking-[0.12em] text-[#0A0A0A]">
                {authorUuid ? (
                  <button type="button" onClick={handleAuthorClick} className="hover:underline">
                    {authorName}
                  </button>
                ) : (
                  authorName
                )}
              </span>
              {post.timeAgo && (
                <span className="shrink-0 text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/45">
                  · {post.timeAgo}
                </span>
              )}
            </div>

            {/* Title — treated like a mini hero headline */}
            <h2 className={`${display} text-[22px] font-black leading-[1.06] tracking-[-0.01em] text-[#0A0A0A] md:text-[27px]`}>
              {post.title}
            </h2>
            <p className="mt-2.5 line-clamp-2 max-w-xl text-[14px] leading-[1.55] text-[#0A0A0A]/55">
              {excerpt}
            </p>

            {/* AI score — the platform's signal, surfaced under every post */}
            <div className="mt-4 flex items-center gap-2.5">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-[#0A0A0A]/55">
                AI
              </span>
              {aiRating !== null ? (
                <>
                  <div className="h-1.5 w-28 overflow-hidden rounded-full bg-[#0A0A0A]/12">
                    <motion.div
                      className="h-full rounded-full bg-[#0A0A0A]"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${aiRating}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
                    />
                  </div>
                  <span className="text-[12px] font-semibold text-[#0A0A0A] tabular-nums">
                    {aiRating}
                    <span className="font-normal text-[#0A0A0A]/45">/100</span>
                  </span>
                </>
              ) : (
                <span className="text-[12px] text-[#0A0A0A]/45">Awaiting AI score</span>
              )}
            </div>

            {/* Engagement */}
            <div className="mt-3 flex items-center gap-4 text-[13px] text-[#0A0A0A]/55">
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
                className="h-[84px] w-[120px] object-cover md:h-[116px] md:w-[164px]"
              />
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
};

const RowSkeleton = () => (
  <div className="flex items-start justify-between gap-12 border-b border-[color:var(--border)] py-9">
    <div className="min-w-0 flex-1">
      <div className="mb-4 flex items-center gap-2.5">
        <div className="shimmer h-6 w-6 rounded-full bg-[#0A0A0A]/10" />
        <div className="shimmer h-3 w-28 bg-[#0A0A0A]/10" />
      </div>
      <div className="shimmer mb-3 h-6 w-3/4 bg-[#0A0A0A]/10" />
      <div className="shimmer mb-2 h-3.5 w-full bg-[#0A0A0A]/10" />
      <div className="shimmer h-3.5 w-1/2 bg-[#0A0A0A]/10" />
    </div>
    <div className="shimmer h-[116px] w-[164px] shrink-0 bg-[#0A0A0A]/10" />
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
      { threshold: 0.1, rootMargin: "100px" }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [hasNextPage, isFetchingNextPage, onLoadMore]);

  return (
    <div>
      {selectedTag && (
        <div className="mb-2 flex items-center gap-3 border-b border-[color:var(--border)] pb-4">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/50">
            Filtered by
          </span>
          <span className={`${display} text-[13px] font-black uppercase tracking-tight text-[#0A0A0A]`}>
            #{selectedTag}
          </span>
          {onClearTagFilter && (
            <button
              type="button"
              onClick={onClearTagFilter}
              className="ml-1 border border-[#0A0A0A] p-0.5 text-[#0A0A0A] transition-colors duration-150 hover:bg-[#0A0A0A] hover:text-[#F5F4F0]"
              aria-label="Clear tag filter"
            >
              <X className="h-3.5 w-3.5" />
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
            <FeedPostCard key={post.id || post.uuid || index} post={post} index={index} />
          ))}
          {hasNextPage && (
            <div ref={observerTarget} className="flex h-20 items-center justify-center">
              {isFetchingNextPage && (
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin border-2 border-[#0A0A0A]/20 border-t-[#0A0A0A]" />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/55">
                    Loading more
                  </span>
                </div>
              )}
            </div>
          )}
          {!hasNextPage && posts.length > 0 && (
            <div className="py-12 text-center">
              <p className="text-[10px] uppercase tracking-[0.24em] text-[#0A0A0A]/45">
                You&apos;ve reached the end
              </p>
            </div>
          )}
        </>
      ) : (
        <div className="py-16 text-center">
          <p className={`${display} text-[22px] font-black uppercase tracking-tight text-[#0A0A0A]`}>
            No posts yet
          </p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-[#0A0A0A]/50">
            Be the first to publish
          </p>
        </div>
      )}
    </div>
  );
};
