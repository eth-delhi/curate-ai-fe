import { useQuery } from "@tanstack/react-query";
import API from "../utils/axiosInstance";
import { SinglePostResponseDto } from "@/utils/types";

// Types based on the backend DTOs
export interface PostResponseDto {
  uuid: string;
  title: string;
  content?: string;
  published: boolean;
  ipfsHash: string;
  authorAddress: string;
  userRating?: number;
  aiRatingId?: number;
  internal_id?: number;
  transactionHash?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedPostsResponseDto {
  posts: PostResponseDto[];
  pagination: PaginationInfo;
}

export interface ListPostsParams {
  page?: number;
  limit?: number;
  authorAddress?: string;
  published?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Fetch posts function
export const fetchPosts = async (
  params: ListPostsParams = {}
): Promise<PaginatedPostsResponseDto> => {
  const searchParams = new URLSearchParams();

  // Add pagination params
  if (params.page !== undefined)
    searchParams.append("page", params.page.toString());
  if (params.limit !== undefined)
    searchParams.append("limit", params.limit.toString());

  // Add other optional params
  if (params.authorAddress)
    searchParams.append("authorAddress", params.authorAddress);
  if (params.published !== undefined)
    searchParams.append("published", params.published.toString());
  if (params.sortBy) searchParams.append("sortBy", params.sortBy);
  if (params.sortOrder) searchParams.append("sortOrder", params.sortOrder);

  const queryString = searchParams.toString();
  const url = `/posts/list${queryString ? `?${queryString}` : ""}`;

  const response = await API.get(url);
  return response.data;
};

// Hook to fetch posts with pagination
export const usePosts = (params: ListPostsParams = {}) => {
  return useQuery({
    queryKey: ["posts", params],
    queryFn: () => fetchPosts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Fetch single post function
export const fetchSinglePost = async (
  uuid: string
): Promise<SinglePostResponseDto> => {
  const response = await API.get(`/posts/${uuid}`);
  return response.data;
};

// Hook to fetch single post
export const useSinglePost = (uuid: string) => {
  return useQuery({
    queryKey: ["post", uuid],
    queryFn: () => fetchSinglePost(uuid),
    enabled: !!uuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
