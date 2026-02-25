import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

// Types
export type NotificationType =
  | "FOLLOWED"
  | "POST_SCORED"
  | "POST_CLAPPED"
  | "FOLLOWED_USER_POSTED";

export interface NotificationResponseDto {
  uuid: string;
  userUuid: string;
  type: NotificationType;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  actorUuid?: string;
  postUuid?: string;
  actor?: {
    uuid: string;
    email: string;
    walletAddress: string;
    profile?: {
      fullName: string;
      username: string;
      profilePic?: string;
    };
  };
  post?: {
    uuid: string;
    title: string;
    ipfsHash: string;
  };
}

export interface PaginatedNotificationsResponseDto {
  notifications: NotificationResponseDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  counts: {
    read: number;
    unread: number;
  };
}

export interface ListNotificationsParams {
  page?: number;
  limit?: number;
  read?: boolean;
}

// Fetch notifications
export const fetchNotifications = async (
  params: ListNotificationsParams = {}
): Promise<PaginatedNotificationsResponseDto> => {
  const { page = 1, limit = 20, read } = params;
  const queryParams = new URLSearchParams({
    page: page.toString(),
    limit: limit.toString(),
  });
  if (read !== undefined) {
    queryParams.append("read", read.toString());
  }
  const response = await API.get(`/notifications?${queryParams.toString()}`);
  return response.data;
};

export const useNotifications = (
  params: ListNotificationsParams = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["notifications", params],
    queryFn: () => fetchNotifications(params),
    enabled: options?.enabled !== undefined ? options.enabled : true,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationUuid: string
): Promise<void> => {
  await API.put(`/notifications/${notificationUuid}/read`);
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      // Invalidate notifications query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  await API.put("/notifications/read-all");
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      // Invalidate notifications query to refresh the list
      queryClient.invalidateQueries({
        queryKey: ["notifications"],
      });
    },
  });
};
