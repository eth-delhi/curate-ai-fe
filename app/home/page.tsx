"use client";

import { useState } from "react";
import BlogList from "@/components/blog/BlogList";
import { usePosts } from "@/hooks/api/posts";
import { mapApiPostsToBlogPosts } from "@/utils/mappers";
import Spinner from "@/components/ui/Spinner";

export default function HomePage() {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const { data, isLoading, error, isError } = usePosts({
    page: currentPage,
    limit: pageSize,
    // published: true
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <Spinner />
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Failed to load posts</p>
          <p className="text-gray-600 text-sm">
            {error?.message || "An error occurred while fetching posts"}
          </p>
        </div>
      </div>
    );
  }

  // Map API data to BlogPost format
  const blogPosts = data ? mapApiPostsToBlogPosts(data.posts) : [];

  // Show empty state if no posts
  if (!isLoading && (!data || data.posts.length === 0)) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-[#f9fafb] to-[#f9fafb] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No posts available</p>
          <p className="text-gray-500 text-sm">
            Be the first to create a post!
          </p>
        </div>
      </div>
    );
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <BlogList
      blogPosts={blogPosts}
      pagination={
        data?.pagination
          ? {
              currentPage: data.pagination.page,
              totalPages: data.pagination.totalPages,
              hasNext: data.pagination.hasNext,
              hasPrev: data.pagination.hasPrev,
            }
          : undefined
      }
      onPageChange={handlePageChange}
    />
  );
}
