import { useQuery } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

// Types
export interface Tag {
  uuid: string;
  name: string;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetTopTagsParams {
  limit?: number;
}

// Fetch top tags
export const fetchTopTags = async (
  params: GetTopTagsParams = {}
): Promise<Tag[]> => {
  const { limit = 15 } = params;
  const response = await API.get(`/tags/top?limit=${limit}`);
  return response.data;
};

export const useTopTags = (
  params: GetTopTagsParams = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["topTags", params],
    queryFn: () => fetchTopTags(params),
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
