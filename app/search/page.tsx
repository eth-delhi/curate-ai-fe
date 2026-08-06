"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Loader2, Search as SearchIcon, User, Sparkles } from "lucide-react";
import HomeNavbar from "@/components/ui/HomeNavbar";
import { FeedPostCard } from "@/components/home-revamp/FeedSection";
import {
  useInfiniteSearch,
  type SearchPost,
  type SearchProfileMatch,
} from "@/hooks/api/search";
import { getIpfsUrl } from "@/utils/ipfs";
import { formatDistanceToNow } from "date-fns";

// Map a backend search post to the shape FeedPostCard renders.
function toDisplayPost(post: SearchPost) {
  let timeAgo = "";
  if (post.createdAt) {
    try {
      timeAgo = formatDistanceToNow(new Date(post.createdAt), {
        addSuffix: true,
      });
    } catch {
      timeAgo = "";
    }
  }
  return {
    uuid: post.uuid,
    id: post.uuid,
    title: post.title,
    content: post.content || "",
    imageUrl: post.thumbnail || null,
    author: post.author?.fullName || post.author?.username || "Anonymous",
    authorFullName: post.author?.fullName,
    authorUuid: post.author?.uuid,
    authorProfilePic: post.author?.profilePic,
    timeAgo,
    clapCount: post.clapCount ?? 0,
    commentCount: 0,
    aiRating: post.aiRating?.rating ?? null,
    tags: post.tags || [],
  };
}

function PeopleResults({ profiles }: { profiles: SearchProfileMatch[] }) {
  if (profiles.length === 0) return null;
  return (
    <section className="mb-8">
      <h2 className="mb-3 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
        People
      </h2>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {profiles.map((profile) => {
          const avatar = getIpfsUrl(profile.profilePic);
          return (
            <Link
              key={profile.userUuid}
              href={`/profile/${profile.userUuid}`}
              className="flex items-center gap-3 rounded-xl border border-border px-4 py-3 transition-colors duration-150 hover:bg-accent"
            >
              {avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatar}
                  alt=""
                  className="h-10 w-10 shrink-0 rounded-full object-cover"
                />
              ) : (
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted">
                  <User className="h-5 w-5 text-muted-foreground" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-foreground">
                  {profile.fullName || profile.username}
                </p>
                <p className="truncate text-xs text-muted-foreground">
                  @{profile.username}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function SearchResults() {
  const searchParams = useSearchParams();
  const q = (searchParams.get("q") ?? "").trim();

  useEffect(() => {
    document.title = q ? `Search: ${q} · Curate AI` : "Search · Curate AI";
  }, [q]);

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearch({ q, type: "all", limit: 10 }, { enabled: q.length > 0 });

  const pages = data?.pages ?? [];
  const profiles = pages[0]?.profiles ?? [];
  const posts = pages.flatMap((page) => page.posts);
  const total = pages[0]?.pagination.total ?? 0;
  const semantic = pages[0]?.semantic ?? false;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <HomeNavbar maxWidth={1400} />

      <div className="pt-[61px]">
        <div className="mx-auto max-w-[720px] px-4 py-8 md:px-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              {q ? (
                <>
                  Results for{" "}
                  <span className="text-muted-foreground">
                    &ldquo;{q}&rdquo;
                  </span>
                </>
              ) : (
                "Search"
              )}
            </h1>
            {q && !isLoading && (
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <span>
                  {total} post{total === 1 ? "" : "s"}
                  {profiles.length > 0
                    ? ` · ${profiles.length} ${
                        profiles.length === 1 ? "person" : "people"
                      }`
                    : ""}
                </span>
                {semantic && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
                    <Sparkles className="h-3 w-3" />
                    Semantic
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Empty query */}
          {!q && (
            <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
              <SearchIcon className="h-8 w-8" />
              <p className="text-sm">
                Type a query in the search bar to find posts and people.
              </p>
            </div>
          )}

          {/* Loading */}
          {q && isLoading && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error */}
          {q && isError && (
            <div className="py-20 text-center text-sm text-destructive">
              Something went wrong while searching. Please try again.
            </div>
          )}

          {/* Results */}
          {q && !isLoading && !isError && (
            <>
              <PeopleResults profiles={profiles} />

              {posts.length > 0 ? (
                <section>
                  <h2 className="mb-1 text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Posts
                  </h2>
                  <div>
                    {posts.map((post) => (
                      <FeedPostCard key={post.uuid} post={toDisplayPost(post)} />
                    ))}
                  </div>

                  {hasNextPage && (
                    <div className="flex justify-center pt-8">
                      <button
                        type="button"
                        onClick={() => fetchNextPage()}
                        disabled={isFetchingNextPage}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2 text-sm font-medium text-foreground transition-colors duration-150 hover:bg-accent disabled:opacity-60"
                      >
                        {isFetchingNextPage && (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        )}
                        Load more
                      </button>
                    </div>
                  )}
                </section>
              ) : (
                profiles.length === 0 && (
                  <div className="flex flex-col items-center gap-3 py-20 text-center text-muted-foreground">
                    <SearchIcon className="h-8 w-8" />
                    <p className="text-sm">
                      No results found for &ldquo;{q}&rdquo;.
                    </p>
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-background">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      }
    >
      <SearchResults />
    </Suspense>
  );
}
