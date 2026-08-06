"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Loader2, FileText, User } from "lucide-react";
import {
  useSearch,
  useDebouncedValue,
  type SearchProfileMatch,
  type SearchPost,
} from "@/hooks/api/search";
import { getIpfsUrl } from "@/utils/ipfs";

const MIN_QUERY_LENGTH = 2;

// Strip HTML so a post excerpt in the dropdown reads as plain text.
function toPlainText(html?: string): string {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function ProfileRow({
  profile,
  onNavigate,
}: {
  profile: SearchProfileMatch;
  onNavigate: () => void;
}) {
  const avatar = getIpfsUrl(profile.profilePic);
  return (
    <Link
      href={`/profile/${profile.userUuid}`}
      onClick={onNavigate}
      className="flex items-center gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-accent"
    >
      {avatar ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={avatar}
          alt=""
          className="h-8 w-8 shrink-0 rounded-full object-cover"
        />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          <User className="h-4 w-4 text-muted-foreground" />
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
}

function PostRow({
  post,
  onNavigate,
}: {
  post: SearchPost;
  onNavigate: () => void;
}) {
  const excerpt = toPlainText(post.content);
  return (
    <Link
      href={`/post/${post.uuid}`}
      onClick={onNavigate}
      className="flex items-start gap-3 px-4 py-2.5 transition-colors duration-150 hover:bg-accent"
    >
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted">
        <FileText className="h-4 w-4 text-muted-foreground" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-foreground">
          {post.title}
        </p>
        {excerpt && (
          <p className="truncate text-xs text-muted-foreground">{excerpt}</p>
        )}
      </div>
    </Link>
  );
}

export default function NavbarSearch({
  className = "",
}: {
  className?: string;
}) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const debounced = useDebouncedValue(value, 250);
  const trimmed = debounced.trim();

  const { data, isFetching } = useSearch(
    { q: trimmed, type: "all", limit: 5 },
    { enabled: open && trimmed.length >= MIN_QUERY_LENGTH }
  );

  // Close the dropdown on any outside click.
  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  const goToResults = () => {
    const q = value.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const profiles = data?.profiles ?? [];
  const posts = data?.posts ?? [];
  const hasResults = profiles.length > 0 || posts.length > 0;
  const showDropdown =
    open && trimmed.length >= MIN_QUERY_LENGTH;

  return (
    <div
      ref={containerRef}
      className={`relative flex min-w-0 justify-center px-0 md:px-4 ${className}`}
    >
      <div className="relative w-full max-w-[360px]">
        <div className="flex w-full items-center gap-3 rounded-[24px] border border-transparent bg-muted px-5 py-2.5 transition-colors duration-150 focus-within:border-primary/30 focus-within:bg-background">
          <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
          <input
            type="text"
            value={value}
            placeholder="Search posts and people"
            aria-label="Search"
            className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
            onChange={(e) => {
              setValue(e.target.value);
              setOpen(true);
            }}
            onFocus={() => setOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                goToResults();
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
          />
          {isFetching && (
            <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
          )}
        </div>

        {showDropdown && (
          <div className="absolute left-0 right-0 z-[10001] mt-2 max-h-[70vh] overflow-y-auto rounded-xl border border-border bg-background shadow-xl">
            {!hasResults && !isFetching ? (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                No matches for &ldquo;{trimmed}&rdquo;
              </div>
            ) : (
              <>
                {profiles.length > 0 && (
                  <div className="py-1">
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      People
                    </p>
                    {profiles.map((profile) => (
                      <ProfileRow
                        key={profile.userUuid}
                        profile={profile}
                        onNavigate={() => setOpen(false)}
                      />
                    ))}
                  </div>
                )}

                {posts.length > 0 && (
                  <div className="border-t border-border py-1">
                    <p className="px-4 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                      Posts
                    </p>
                    {posts.map((post) => (
                      <PostRow
                        key={post.uuid}
                        post={post}
                        onNavigate={() => setOpen(false)}
                      />
                    ))}
                  </div>
                )}
              </>
            )}

            <button
              type="button"
              onClick={goToResults}
              className="flex w-full items-center gap-2 border-t border-border px-4 py-3 text-left text-sm font-medium text-primary transition-colors duration-150 hover:bg-accent"
            >
              <Search className="h-4 w-4" />
              See all results for &ldquo;{trimmed}&rdquo;
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
