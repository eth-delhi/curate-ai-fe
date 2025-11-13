import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

// Types based on the backend DTOs
export interface FollowUserDto {
  userUuid: string;
}

export interface UnfollowUserDto {
  userUuid: string;
}

export interface UserFollowStatusDto {
  isFollowing: boolean;
  isFollowedBy: boolean;
}

export interface FollowUser {
  uuid: string;
  email: string;
  walletAddress: string;
  profile?: {
    fullName?: string;
    username?: string;
    bio?: string;
    location?: string;
    website?: string;
    xHandle?: string;
    github?: string;
    profilePic?: string;
    // Optional fields that may not be present in all responses
    id?: number;
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
  };
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

// API response structure for followers/following lists
export interface FollowRelationship {
  uuid: string;
  followerUuid: string;
  followingUuid: string;
  createdAt: string;
  follower: FollowUser;
  following: FollowUser;
}

// Follow a user
export const followUser = async (
  data: FollowUserDto
): Promise<{ message: string }> => {
  const response = await API.post("/follows", data);
  return response.data;
};

export const useFollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: followUser,
    onSuccess: (_, variables) => {
      // Invalidate follow status and lists
      queryClient.invalidateQueries({
        queryKey: ["followStatus", variables.userUuid],
      });
      queryClient.invalidateQueries({
        queryKey: ["following"],
      });
      queryClient.invalidateQueries({
        queryKey: ["followers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userFollowing", variables.userUuid],
      });
      queryClient.invalidateQueries({
        queryKey: ["userFollowers", variables.userUuid],
      });
      // Invalidate profile to update follower count
      queryClient.invalidateQueries({
        queryKey: ["profile", variables.userUuid],
      });
    },
  });
};

// Unfollow a user
export const unfollowUser = async (
  data: UnfollowUserDto
): Promise<{ message: string }> => {
  const response = await API.delete("/follows", { data });
  return response.data;
};

export const useUnfollowUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unfollowUser,
    onSuccess: (_, variables) => {
      // Invalidate follow status and lists
      queryClient.invalidateQueries({
        queryKey: ["followStatus", variables.userUuid],
      });
      queryClient.invalidateQueries({
        queryKey: ["following"],
      });
      queryClient.invalidateQueries({
        queryKey: ["followers"],
      });
      queryClient.invalidateQueries({
        queryKey: ["userFollowing", variables.userUuid],
      });
      queryClient.invalidateQueries({
        queryKey: ["userFollowers", variables.userUuid],
      });
      // Invalidate profile to update follower count
      queryClient.invalidateQueries({
        queryKey: ["profile", variables.userUuid],
      });
    },
  });
};

// Get follow status (check if current user is following a user)
export const getFollowStatus = async (
  userUuid: string
): Promise<UserFollowStatusDto> => {
  const response = await API.get(`/follows/status/${userUuid}`);
  return response.data;
};

export const useFollowStatus = (
  userUuid: string,
  options: { enabled?: boolean } = {}
) => {
  return useQuery({
    queryKey: ["followStatus", userUuid],
    queryFn: () => getFollowStatus(userUuid),
    enabled: options.enabled !== false && !!userUuid,
    staleTime: 1 * 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Get my following list
export const getFollowing = async (): Promise<FollowUser[]> => {
  const response = await API.get<FollowRelationship[]>("/follows/following");
  // Extract the 'following' user from each relationship
  return response.data.map((rel) => rel.following);
};

export const useFollowing = () => {
  return useQuery({
    queryKey: ["following"],
    queryFn: getFollowing,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get my followers list
export const getFollowers = async (): Promise<FollowUser[]> => {
  const response = await API.get<FollowRelationship[]>("/follows/followers");
  // Extract the 'follower' user from each relationship
  return response.data.map((rel) => rel.follower);
};

export const useFollowers = () => {
  return useQuery({
    queryKey: ["followers"],
    queryFn: getFollowers,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get user's following list
export const getUserFollowing = async (
  userUuid: string
): Promise<FollowUser[]> => {
  const response = await API.get<FollowRelationship[]>(
    `/follows/${userUuid}/following`
  );
  // Extract the 'following' user from each relationship
  return response.data.map((rel) => rel.following);
};

export const useUserFollowing = (userUuid: string) => {
  return useQuery({
    queryKey: ["userFollowing", userUuid],
    queryFn: () => getUserFollowing(userUuid),
    enabled: !!userUuid,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// Get user's followers list
export const getUserFollowers = async (
  userUuid: string
): Promise<FollowUser[]> => {
  const response = await API.get<FollowRelationship[]>(
    `/follows/${userUuid}/followers`
  );
  // Extract the 'follower' user from each relationship
  return response.data.map((rel) => rel.follower);
};

export const useUserFollowers = (userUuid: string) => {
  return useQuery({
    queryKey: ["userFollowers", userUuid],
    queryFn: () => getUserFollowers(userUuid),
    enabled: !!userUuid,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};
