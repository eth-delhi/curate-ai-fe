"use client";

import { Navbar } from "@/components/ui/Navbar";
import { BackgroundAnimation } from "./BackgroundAnimation";
import { LeftSidebar } from "./LeftSidebar";
import { MainContent } from "./MainContent";
import { RightSidebar } from "./RightSidebar";
import { Pagination } from "@/components/ui/Pagination";
import type { BlogPost } from "@/utils/types";

interface BlogListProps {
  blogPosts?: BlogPost[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  onPageChange?: (page: number) => void;
}

export default function BlogList({
  blogPosts = [],
  pagination,
  onPageChange,
}: BlogListProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/50 relative overflow-hidden">
      {/* Animated background */}
      <BackgroundAnimation />

      {/* <Navbar /> */}
      <div className="flex pt-20 relative z-10 min-h-screen">
        {/* Left Sidebar */}
        <div className="opacity-0 animate-slide-in-left hidden xl:block xl:w-64 flex-shrink-0">
          <LeftSidebar />
        </div>

        {/* Main Content */}
        <div
          className="opacity-0 animate-fade-in-up flex-1 min-w-0"
          style={{ animationDelay: "0.2s" }}
        >
          <MainContent blogPosts={blogPosts} />
          {pagination && onPageChange && (
            <div className="px-4 sm:px-6 lg:px-8">
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                hasNext={pagination.hasNext}
                hasPrev={pagination.hasPrev}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </div>

        {/* Right Sidebar */}
        <div
          className="opacity-0 animate-slide-in-right hidden xl:block xl:w-80 flex-shrink-0"
          style={{ animationDelay: "0.2s" }}
        >
          <RightSidebar />
        </div>
      </div>

      <style jsx>{`
        @keyframes slide-in-left {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slide-in-right {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-in-left {
          animation: slide-in-left 0.5s ease-out forwards;
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out forwards;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
