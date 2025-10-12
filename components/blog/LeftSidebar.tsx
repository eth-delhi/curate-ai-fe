"use client";

import Link from "next/link";
import {
  HomeIcon,
  BookmarkIcon,
  TagIcon,
  TrendingUp,
  Settings,
} from "lucide-react";

export const LeftSidebar = () => {
  return (
    <aside className="w-90 fixed left-0 top-12 h-screen py-6 px-5 bg-white overflow-y-auto shadow-xs">
      <nav className="space-y-2 mb-8">
        <div className="hover:scale-105 transition-transform">
          <Link
            href="/"
            className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md group transition-colors"
          >
            <div className="flex items-center gap-2">
              <HomeIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                Home
              </span>
            </div>
            <span className="text-xs font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full group-hover:bg-blue-100 transition-colors">
              12
            </span>
          </Link>
        </div>

        <div className="hover:scale-105 transition-transform">
          <Link
            href="/reading-list"
            className="flex items-center justify-between px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md group transition-colors"
          >
            <div className="flex items-center gap-2">
              <BookmarkIcon className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
                Reading List
              </span>
            </div>
            <span className="text-xs font-medium text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded-full group-hover:bg-blue-100 transition-colors">
              5
            </span>
          </Link>
        </div>

        <div className="hover:scale-105 transition-transform">
          <Link
            href="/tags"
            className="flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-blue-50 rounded-md group transition-colors"
          >
            <TagIcon className="h-4 w-4 text-blue-500" />
            <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">
              # Tags
            </span>
          </Link>
        </div>
      </nav>

      <div className="mt-6">
        <div className="flex items-center justify-between mb-3 px-1">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider flex items-center">
            <TrendingUp className="h-3.5 w-3.5 text-blue-500 mr-1.5" />
            POPULAR TAGS
          </h3>
          <button className="text-gray-400 hover:text-blue-500 hover:rotate-90 transition-all duration-200">
            <Settings className="h-3.5 w-3.5" />
          </button>
        </div>
        <div className="space-y-1">
          {[
            "blockchain",
            "web3",
            "javascript",
            "react",
            "nextjs",
            "defi",
            "nft",
            "crypto",
          ].map((tag, index) => (
            <div
              key={tag}
              className="opacity-0 animate-fade-in"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <Link
                href={`/t/${tag}`}
                className="flex items-center px-3 py-1.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-md transition-colors"
              >
                <span className="font-medium">#{tag}</span>
              </Link>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateX(-20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.4s ease-out forwards;
        }
      `}</style>
    </aside>
  );
};
