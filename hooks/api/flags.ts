import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

// Types
export interface AddFlagDto {
  postUuid: string;
}

export interface RemoveFlagDto {
  postUuid: string;
}

export interface FlagStatusResponse {
  hasFlagged: boolean;
}

// Add flag
export const addFlag = async (data: AddFlagDto): Promise<void> => {
  await API.post("/flags/add", data);
};

export const useAddFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addFlag,
    onSuccess: (_, variables) => {
      // Invalidate flag status query
      queryClient.invalidateQueries({
        queryKey: ["flagStatus", variables.postUuid],
      });
      // Invalidate post query to refresh flag count
      queryClient.invalidateQueries({
        queryKey: ["post", variables.postUuid],
      });
    },
  });
};

// Remove flag
export const removeFlag = async (data: RemoveFlagDto): Promise<void> => {
  await API.delete("/flags/remove", { data });
};

export const useRemoveFlag = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeFlag,
    onSuccess: (_, variables) => {
      // Invalidate flag status query
      queryClient.invalidateQueries({
        queryKey: ["flagStatus", variables.postUuid],
      });
      // Invalidate post query to refresh flag count
      queryClient.invalidateQueries({
        queryKey: ["post", variables.postUuid],
      });
    },
  });
};

// Check flag status
export const checkFlagStatus = async (
  postUuid: string
): Promise<FlagStatusResponse> => {
  const response = await API.get(`/flags/check/${postUuid}`);
  return response.data;
};

export const useFlagStatus = (postUuid: string) => {
  return useQuery({
    queryKey: ["flagStatus", postUuid],
    queryFn: () => checkFlagStatus(postUuid),
    enabled: !!postUuid,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
