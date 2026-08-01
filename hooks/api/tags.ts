import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

// Fetch the current user's selected topics of interest
export const fetchUserInterests = async (): Promise<{
  interests: Pick<Tag, "uuid" | "name" | "count">[];
}> => {
  const response = await API.get("/tags/interests");
  return response.data;
};

export const useUserInterests = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["userInterests"],
    queryFn: fetchUserInterests,
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

// Set (replace) the current user's selected topics of interest
export const postUserInterests = async (
  tagUuids: string[]
): Promise<{ interests: Pick<Tag, "uuid" | "name" | "count">[] }> => {
  const response = await API.post("/tags/interests", { tagUuids });
  return response.data;
};

export const useSetUserInterests = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postUserInterests,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userInterests"] });
    },
  });
};
