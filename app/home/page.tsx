"use client";

import { useEffect } from "react";
import { useHomeRevampData } from "@/hooks/useHomeRevampData";
import HomeNavbar from "@/components/ui/HomeNavbar";
import {
  FeedSection,
  LeftSidebar,
  RightSidebar,
  LoadingState,
  ErrorState,
} from "@/components/home-revamp";

export default function HomeRevampPage() {
  const {
    feedPosts,
    activeTab,
    isLoading,
    isError,
    error,
    handleTabChange,
    handleTagClick,
    selectedTag,
    clearTagFilter,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useHomeRevampData();

  useEffect(() => {
    document.title = "Curate AI: Where Intelligence Meets Curation";
  }, []);

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="home-page min-h-screen bg-background text-foreground">
      <style jsx global>{`
        /* Scoped to this page subtree so we don’t change app-wide metrics after client nav. */
        .home-page {
          font-family: var(--font-sans), system-ui, sans-serif;
        }

        .prose {
          --tw-prose-headings: #1a1a1a;
          --tw-prose-body: #1a1a1a;
          --tw-prose-links: #1a1a1a;
          --tw-prose-bold: #1a1a1a;
          --tw-prose-counters: #6b6b6b;
          --tw-prose-bullets: #e6e5e0;
          --tw-prose-hr: #e6e5e0;
          --tw-prose-quotes: #1a1a1a;
          --tw-prose-quote-borders: #e6e5e0;
          --tw-prose-captions: #6b6b6b;
          --tw-prose-code: #1a1a1a;
          --tw-prose-pre-code: #e6e5e0;
          --tw-prose-pre-bg: #1a1a1a;
          --tw-prose-th-borders: #e6e5e0;
          --tw-prose-td-borders: #e6e5e0;
        }

        .overflow-y-auto,
        .overflow-auto,
        .overflow-x-auto {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .overflow-y-auto::-webkit-scrollbar,
        .overflow-auto::-webkit-scrollbar,
        .overflow-x-auto::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <HomeNavbar />

      <div className="pt-[60px]">
        <div className="max-w-[1336px] mx-auto px-6 py-6 flex gap-12">
          <aside className="hidden lg:block w-[220px] shrink-0">
            <LeftSidebar />
          </aside>

          <main className="flex-1 max-w-[680px]">
            <FeedSection
              posts={feedPosts}
              activeTab={activeTab}
              onTabChange={handleTabChange}
              isLoading={isLoading}
              selectedTag={selectedTag}
              onClearTagFilter={clearTagFilter}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={fetchNextPage}
            />
          </main>

          <aside className="hidden lg:block w-[320px] shrink-0">
            <RightSidebar onTopicClick={handleTagClick} />
          </aside>
        </div>
      </div>
    </div>
  );
}
