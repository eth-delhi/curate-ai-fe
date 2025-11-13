"use client";

import { useHomeRevampData } from "@/hooks/useHomeRevampData";
import HomeNavbar from "@/components/ui/HomeNavbar";
import {
  FeaturedPostsSection,
  FeedSection,
  LeftSidebar,
  RightSidebar,
  LoadingState,
  ErrorState,
} from "@/components/home-revamp";

export default function HomeRevampPage() {
  const {
    featuredPosts,
    feedPosts,
    activeTab,
    isLoading,
    isError,
    error,
    handleTabChange,
  } = useHomeRevampData();

  if (isLoading) {
    return <LoadingState />;
  }

  if (isError) {
    return <ErrorState error={error} />;
  }

  return (
    <div className="flex flex-col h-screen bg-[#f0f0f0] checkered-bg">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800&display=swap");
        * {
          font-family: "Poppins", sans-serif;
        }

        /* Subtle checkered texture */
        .checkered-bg {
          background-image: linear-gradient(
              45deg,
              rgba(0, 0, 0, 0.02) 25%,
              transparent 25%
            ),
            linear-gradient(-45deg, rgba(0, 0, 0, 0.02) 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, rgba(0, 0, 0, 0.02) 75%),
            linear-gradient(-45deg, transparent 75%, rgba(0, 0, 0, 0.02) 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
        }

        .prose {
          --tw-prose-headings: #374151;
          --tw-prose-body: #4b5563;
          --tw-prose-links: #374151;
          --tw-prose-bold: #111827;
          --tw-prose-counters: #6b7280;
          --tw-prose-bullets: #d1d5db;
          --tw-prose-hr: #e5e7eb;
          --tw-prose-quotes: #374151;
          --tw-prose-quote-borders: #e5e7eb;
          --tw-prose-captions: #6b7280;
          --tw-prose-code: #111827;
          --tw-prose-pre-code: #e5e7eb;
          --tw-prose-pre-bg: #1f2937;
          --tw-prose-th-borders: #d1d5db;
          --tw-prose-td-borders: #e5e7eb;
        }

        /* Hide scrollbar everywhere */
        .overflow-y-auto,
        .overflow-auto,
        .overflow-x-auto {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .overflow-y-auto::-webkit-scrollbar,
        .overflow-auto::-webkit-scrollbar,
        .overflow-x-auto::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>

      {/* Top Navbar - Full Width */}
      <HomeNavbar />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden pt-16">
        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-white">
          {/* Left Sidebar - Hidden on mobile and tablet */}
          <div className="hidden lg:block">
            <LeftSidebar />
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto px-4 w-full lg:w-auto">
            <div className="p-4">
              {/* Featured Posts Section */}
              {/* <FeaturedPostsSection
                posts={featuredPosts}
                isLoading={isLoading}
              /> */}

              {/* Feed Section */}
              <FeedSection
                posts={feedPosts}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                isLoading={isLoading}
              />
            </div>
          </div>

          {/* Right Sidebar - Hidden on mobile and tablet */}
          <div className="hidden lg:block">
            <RightSidebar />
          </div>
        </div>
      </div>
    </div>
  );
}
