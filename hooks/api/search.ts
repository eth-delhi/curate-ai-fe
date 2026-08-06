import {
  useQuery,
  useInfiniteQuery,
  keepPreviousData,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import API from "../utils/axiosInstance";
import type { PaginationInfo } from "./posts";

// Author subset returned on search posts (mirrors the backend author shape).
export interface SearchAuthor {
  uuid?: string;
  username?: string;
  fullName?: string;
  profilePic?: string | null;
}

// A near-match profile (by username / full name). matchScore is the trigram
// similarity of the best-matching field to the query (0..1).
export interface SearchProfileMatch {
  userUuid: string;
  username: string;
  fullName: string;
  profilePic?: string | null;
  matchScore: number;
}

// A post result. relevanceScore is the blended keyword + semantic rank.
export interface SearchPost {
  uuid: string;
  title: string;
  content?: string;
  thumbnail?: string | null;
  ipfsHash?: string;
  authorAddress?: string;
  author?: SearchAuthor;
  aiRating?: { rating: number | null };
  clapCount?: number;
  tags?: string[];
  xMinRead?: number;
  createdAt?: string | Date;
  status?: string;
  relevanceScore?: number;
}

export interface SearchResponse {
  query: string;
  posts: SearchPost[];
  profiles: SearchProfileMatch[];
  pagination: PaginationInfo;
  // Whether embedding-based semantic ranking ran, or it fell back to keyword.
  semantic: boolean;
}

export type SearchType = "all" | "posts" | "profiles";

export interface SearchParams {
  q: string;
  type?: SearchType;
  page?: number;
  limit?: number;
}

export const fetchSearch = async (
  params: SearchParams
): Promise<SearchResponse> => {
  const sp = new URLSearchParams();
  sp.append("q", params.q);
  if (params.type) sp.append("type", params.type);
  if (params.page !== undefined) sp.append("page", String(params.page));
  if (params.limit !== undefined) sp.append("limit", String(params.limit));

  const response = await API.get(`/search?${sp.toString()}`);
  return response.data;
};

// Single-page search, used by the navbar quick-search dropdown. Only fires
// once the (already-debounced) query is at least 2 characters.
export const useSearch = (
  params: SearchParams,
  options?: { enabled?: boolean }
) => {
  const q = params.q.trim();
  return useQuery({
    queryKey: [
      "search",
      q,
      params.type ?? "all",
      params.page ?? 1,
      params.limit ?? 10,
    ],
    queryFn: () => fetchSearch({ ...params, q }),
    enabled: (options?.enabled ?? true) && q.length >= 2,
    placeholderData: keepPreviousData,
    staleTime: 60 * 1000,
  });
};

// Paginated search for the full results page (infinite scroll / load-more).
// Profiles are returned on the first page only.
export const useInfiniteSearch = (
  params: Omit<SearchParams, "page">,
  options?: { enabled?: boolean }
) => {
  const q = params.q.trim();
  const pageSize = params.limit ?? 10;
  return useInfiniteQuery({
    queryKey: ["search-infinite", q, params.type ?? "all", pageSize],
    queryFn: ({ pageParam = 1 }) =>
      fetchSearch({ ...params, q, page: pageParam, limit: pageSize }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNext
        ? lastPage.pagination.page + 1
        : undefined,
    initialPageParam: 1,
    enabled: (options?.enabled ?? true) && q.length >= 1,
    staleTime: 60 * 1000,
  });
};

// Returns a debounced copy of `value` that only updates after `delay` ms of
// no changes — used to avoid firing a search request on every keystroke.
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}
