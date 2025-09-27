import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

// Types for comments
export interface CommentDto {
  uuid: string;
  postUuid: string;
  userWalletAddress: string;
  content: string;
  parentCommentUuid?: string;
  createdAt: string;
  updatedAt: string;
  replies?: CommentDto[];
}

export interface CreateCommentDto {
  postUuid: string;
  content: string;
  parentCommentUuid?: string;
}

export interface UpdateCommentDto {
  content: string;
}

// Create comment
export const createComment = async (
  data: CreateCommentDto
): Promise<CommentDto> => {
  const response = await API.post("/comments/create", data);
  return response.data;
};

export const useCreateComment = (postUuid?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createComment,
    onMutate: async (newComment) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post", postUuid] });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(["post", postUuid]);

      // Optimistically update the post data
      if (postUuid && previousPost) {
        queryClient.setQueryData(["post", postUuid], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: [
              {
                uuid: `temp-${Date.now()}`,
                postUuid: newComment.postUuid,
                userWalletAddress: "temp-user",
                content: newComment.content,
                parentCommentUuid: newComment.parentCommentUuid,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                replies: [],
              },
              ...(old.comments || []),
            ],
          };
        });
      }

      return { previousPost };
    },
    onError: (err, newComment, context) => {
      // Rollback on error
      if (postUuid && context?.previousPost) {
        queryClient.setQueryData(["post", postUuid], context.previousPost);
      }
    },
    onSettled: (data) => {
      // Always refetch after error or success
      const targetPostUuid = postUuid || data?.postUuid;
      if (targetPostUuid) {
        queryClient.invalidateQueries({ queryKey: ["post", targetPostUuid] });
      }
    },
  });
};

// Update comment
export const updateComment = async ({
  uuid,
  data,
}: {
  uuid: string;
  data: UpdateCommentDto;
}): Promise<CommentDto> => {
  const response = await API.put(`/comments/${uuid}`, data);
  return response.data;
};

export const useUpdateComment = (postUuid?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateComment,
    onMutate: async ({ uuid, data }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post", postUuid] });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(["post", postUuid]);

      // Optimistically update the comment
      if (postUuid && previousPost) {
        queryClient.setQueryData(["post", postUuid], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: (old.comments || []).map((comment: any) =>
              comment.uuid === uuid
                ? {
                    ...comment,
                    content: data.content,
                    updatedAt: new Date().toISOString(),
                  }
                : comment
            ),
          };
        });
      }

      return { previousPost };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      if (postUuid && context?.previousPost) {
        queryClient.setQueryData(["post", postUuid], context.previousPost);
      }
    },
    onSettled: (data) => {
      // Always refetch after error or success
      const targetPostUuid = postUuid || data?.postUuid;
      if (targetPostUuid) {
        queryClient.invalidateQueries({ queryKey: ["post", targetPostUuid] });
      }
    },
  });
};

// Delete comment
export const deleteComment = async (uuid: string): Promise<void> => {
  await API.delete(`/comments/${uuid}`);
};

export const useDeleteComment = (postUuid?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteComment,
    onMutate: async (commentUuid) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["post", postUuid] });

      // Snapshot the previous value
      const previousPost = queryClient.getQueryData(["post", postUuid]);

      // Optimistically remove the comment
      if (postUuid && previousPost) {
        queryClient.setQueryData(["post", postUuid], (old: any) => {
          if (!old) return old;
          return {
            ...old,
            comments: (old.comments || []).filter(
              (comment: any) => comment.uuid !== commentUuid
            ),
          };
        });
      }

      return { previousPost };
    },
    onError: (err, commentUuid, context) => {
      // Rollback on error
      if (postUuid && context?.previousPost) {
        queryClient.setQueryData(["post", postUuid], context.previousPost);
      }
    },
    onSettled: (data, commentUuid) => {
      // Always refetch after error or success
      if (postUuid) {
        queryClient.invalidateQueries({ queryKey: ["post", postUuid] });
      } else {
        queryClient.invalidateQueries({ queryKey: ["post"] });
      }
    },
  });
};

// Get comments for a post - now using the comments from post data
export const useComments = (comments?: CommentDto[]) => {
  return {
    data: comments || [],
    isLoading: false,
    error: null,
  };
};
