import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

// Types based on the backend DTOs
export interface UpdateProfileDto {
  username?: string;
  fullName?: string;
  bio?: string;
  location?: string;
  website?: string;
  xHandle?: string;
  github?: string;
  profilePic?: string; // IPFS hash for profile picture
}

export interface ProfileResponse {
  id: number;
  userId: string;
  username: string;
  fullName: string;
  bio?: string;
  location?: string;
  website?: string;
  xHandle?: string;
  github?: string;
  profilePic?: string;
  createdAt: string;
  updatedAt: string;
}

// User profile response type based on backend
export interface UserProfileResponse {
  uuid: string;
  email: string;
  walletAddress: string;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    id: number;
    userId: string;
    username: string;
    fullName: string;
    bio?: string;
    location?: string;
    website?: string;
    xHandle?: string;
    github?: string;
    profilePic?: string;
    createdAt: string;
    updatedAt: string;
  };
  stats: {
    postsCount: number;
    scoresCount: number;
    commentsCount: number;
    flagsCount: number;
  };
}

// Fetch user profile
export const fetchUserProfile = async (
  userUuid: string
): Promise<UserProfileResponse> => {
  const response = await API.get(`/profile/${userUuid}`);
  return response.data;
};

export const useUserProfile = (
  userUuid: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["profile", userUuid],
    queryFn: () => fetchUserProfile(userUuid),
    enabled: options?.enabled !== undefined ? options.enabled : !!userUuid,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Update profile
export const updateProfile = async (
  id: string,
  data: UpdateProfileDto
): Promise<ProfileResponse> => {
  const response = await API.patch(`/profile/${id}`, data);
  return response.data;
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProfileDto }) =>
      updateProfile(id, data),
    onSuccess: (_, variables) => {
      // Invalidate and refetch profile queries
      queryClient.invalidateQueries({
        queryKey: ["profile", variables.id],
      });

      // Explicitly refetch the profile query to ensure it updates
      queryClient.refetchQueries({
        queryKey: ["profile", variables.id],
      });

      // Invalidate posts queries to refresh user data
      queryClient.invalidateQueries({
        queryKey: ["posts"],
      });
    },
  });
};
