import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

// Types
export interface CreateClapDto {
  postUuid: string;
  clapCount?: number; // Number of claps to add (defaults to 1 if not provided)
}

export interface ClapResponseDto {
  uuid: string;
  postUuid: string;
  userUuid: string;
  clapCount: number;
  createdAt: Date;
  postClapCount: number; // Total claps on the post
}

export interface ClapStatusResponse {
  clapCount: number;
}

export interface ClapCountResponse {
  clapCount: number;
}

// Add clap
export const addClap = async (
  data: CreateClapDto
): Promise<ClapResponseDto> => {
  const response = await API.post("/claps", data);
  return response.data;
};

export const useAddClap = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addClap,
    onSuccess: (data, variables) => {
      // Invalidate clap status query
      queryClient.invalidateQueries({
        queryKey: ["clapStatus", variables.postUuid],
      });
      // Invalidate clap count query
      queryClient.invalidateQueries({
        queryKey: ["clapCount", variables.postUuid],
      });
      // Invalidate claps by post query
      queryClient.invalidateQueries({
        queryKey: ["clapsByPost", variables.postUuid],
      });
      // Invalidate post query to refresh clap count
      queryClient.invalidateQueries({
        queryKey: ["post", variables.postUuid],
      });
    },
  });
};

// Get claps by post
export const getClapsByPost = async (
  postUuid: string
): Promise<ClapResponseDto[]> => {
  const response = await API.get(`/claps/post/${postUuid}`);
  return response.data;
};

export const useClapsByPost = (postUuid: string) => {
  return useQuery({
    queryKey: ["clapsByPost", postUuid],
    queryFn: () => getClapsByPost(postUuid),
    enabled: !!postUuid,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get user's clap count for a post
export const getUserClapCount = async (
  postUuid: string
): Promise<ClapStatusResponse> => {
  const response = await API.get(`/claps/check/${postUuid}`);
  return response.data;
};

export const useClapStatus = (postUuid: string) => {
  return useQuery({
    queryKey: ["clapStatus", postUuid],
    queryFn: () => getUserClapCount(postUuid),
    enabled: !!postUuid,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get max claps per user
export interface MaxClapsResponse {
  maxClapsPerUser: number;
}

export const getMaxClapsPerUser = async (): Promise<MaxClapsResponse> => {
  const response = await API.get("/claps/max-per-user");
  return response.data;
};

export const useMaxClapsPerUser = () => {
  return useQuery({
    queryKey: ["maxClapsPerUser"],
    queryFn: getMaxClapsPerUser,
    staleTime: 60 * 60 * 1000, // 1 hour (this value rarely changes)
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  });
};

// Get clap count
export const getClapCount = async (
  postUuid: string
): Promise<ClapCountResponse> => {
  const response = await API.get(`/claps/count/${postUuid}`);
  return response.data;
};

export const useClapCount = (postUuid: string) => {
  return useQuery({
    queryKey: ["clapCount", postUuid],
    queryFn: () => getClapCount(postUuid),
    enabled: !!postUuid,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
