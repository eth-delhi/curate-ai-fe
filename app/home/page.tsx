"use client";

import { useEffect } from "react";
import { MotionConfig } from "framer-motion";
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
    return (
      <div className="home-page">
        <LoadingState />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="home-page">
        <ErrorState error={error} />
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion="user">
    <div className="home-page relative min-h-screen bg-background text-foreground">
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

      <HomeNavbar maxWidth={1400} />

      <div className="relative z-10 pt-[61px]">
        <div className="mx-auto flex max-w-[1400px] items-start px-4 md:px-6">
          <aside className="sticky top-[61px] hidden w-[248px] shrink-0 self-start py-10 pr-10 lg:block">
            <LeftSidebar onTopicClick={handleTagClick} />
          </aside>

          <main className="min-w-0 flex-1 px-0 py-4 lg:border-x lg:border-[color:var(--border)] lg:px-14">
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

          <aside className="sticky top-[61px] hidden w-[352px] shrink-0 self-start py-10 pl-12 xl:block">
            <RightSidebar onTopicClick={handleTagClick} />
          </aside>
        </div>
      </div>
    </div>
    </MotionConfig>
  );
}
