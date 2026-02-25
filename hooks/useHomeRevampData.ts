import { useState, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useInfinitePosts } from "@/hooks/api/posts";
import { mapApiPostsToBlogPosts } from "@/utils/mappers";
import { convertBlogPostToDisplayPost } from "@/utils/home-revamp";
import { DUMMY_FEATURED_POSTS } from "@/constants/home-revamp";
import { DisplayPost } from "@/types/home-revamp";

export const useHomeRevampData = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [pageSize] = useState(10);
  const [activeTab, setActiveTab] = useState("new");

  // Get tag from URL query params
  const tagFromUrl = searchParams.get("tag");

  // Determine if following or hot tab is active
  const isFollowingTab = activeTab === "following";
  const isHotTab = activeTab === "hot";

  // Use infinite query for infinite scroll
  const {
    data,
    isLoading,
    error,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfinitePosts({
    limit: pageSize,
    sortOrder: "desc",
    sortBy: "createdAt",
    // TODO: Add published: true filter later
    // published: true,
    followingOnly: isFollowingTab ? true : undefined,
    hot: isHotTab ? true : undefined,
    tag: isFollowingTab || isHotTab ? undefined : tagFromUrl || undefined,
  });

  // Flatten all pages into a single array of posts
  const allPosts = useMemo(() => {
    if (!data?.pages) return [];
    return data.pages.flatMap((page) => page.posts);
  }, [data]);

  // Map API data to BlogPost format - all accumulated posts
  const blogPosts = useMemo(
    () => (allPosts.length > 0 ? mapApiPostsToBlogPosts(allPosts) : []),
    [allPosts]
  );

  // Convert BlogPosts to DisplayPosts
  const convertedPosts = useMemo(
    () =>
      blogPosts.map((post, index) => convertBlogPostToDisplayPost(post, index)),
    [blogPosts]
  );

  // Featured posts: first 4 posts with thumbnails only, or dummy data if not enough
  const postsWithThumbnails = convertedPosts.filter((post) => post.imageUrl);
  const featuredPosts: DisplayPost[] =
    postsWithThumbnails.length >= 4
      ? postsWithThumbnails.slice(0, 4)
      : DUMMY_FEATURED_POSTS;

  // Feed posts: all real posts
  const feedPosts: DisplayPost[] = convertedPosts;

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    // Clear tag filter when switching to following or hot tab (they shouldn't be combined)
    if ((tab === "following" || tab === "hot") && tagFromUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("tag");
      router.push(`/home-revamp?${params.toString()}`);
    }
  };

  // Function to handle tag click - updates URL
  // When clicking a tag, switch to "new" tab and clear following/hot filters
  const handleTagClick = (tag: string) => {
    setActiveTab("new"); // Switch to new tab when filtering by tag
    const params = new URLSearchParams(searchParams.toString());
    params.set("tag", tag);
    router.push(`/home-revamp?${params.toString()}`);
  };

  // Function to clear tag filter
  const clearTagFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("tag");
    router.push(`/home-revamp?${params.toString()}`);
  };

  return {
    // Data
    featuredPosts,
    feedPosts,
    blogPosts,

    // State
    activeTab,
    pageSize,
    selectedTag: tagFromUrl,

    // Loading states
    isLoading,
    isError,
    error,
    isFetchingNextPage,
    hasNextPage,

    // Actions
    fetchNextPage,
    handleTabChange,
    handleTagClick,
    clearTagFilter,
  };
};
