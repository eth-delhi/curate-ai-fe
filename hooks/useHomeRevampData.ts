import { useState } from "react";
import { usePosts } from "@/hooks/api/posts";
import { mapApiPostsToBlogPosts } from "@/utils/mappers";
import { convertBlogPostToDisplayPost } from "@/utils/home-revamp";
import { DUMMY_FEATURED_POSTS } from "@/constants/home-revamp";
import { DisplayPost } from "@/types/home-revamp";

export const useHomeRevampData = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("for-you");

  const { data, isLoading, error, isError } = usePosts({
    page: currentPage,
    limit: pageSize,
    sortOrder: "desc",
    sortBy: "createdAt",
  });

  // Map API data to BlogPost format
  const blogPosts = data ? mapApiPostsToBlogPosts(data.posts) : [];

  // Convert BlogPosts to DisplayPosts
  const convertedPosts = blogPosts.map((post, index) =>
    convertBlogPostToDisplayPost(post, index)
  );

  // Featured posts: first 4 posts with thumbnails only, or dummy data if not enough
  const postsWithThumbnails = convertedPosts.filter((post) => post.imageUrl);
  const featuredPosts: DisplayPost[] =
    postsWithThumbnails.length >= 4
      ? postsWithThumbnails.slice(0, 4)
      : DUMMY_FEATURED_POSTS;

  // Feed posts: all real posts
  const feedPosts: DisplayPost[] = convertedPosts;

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
  };

  return {
    // Data
    featuredPosts,
    feedPosts,
    blogPosts,

    // State
    activeTab,
    currentPage,
    pageSize,

    // Loading states
    isLoading,
    isError,
    error,

    // Actions
    handlePageChange,
    handleTabChange,
  };
};
