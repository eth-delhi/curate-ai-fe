import { useMutation } from "@tanstack/react-query";
import API from "../utils/axiosInstance";
import {
  CreatePostRequestDto,
  CreatePostResponseDto,
  UpdatePostRequestDto,
} from "@/utils/types";
import { usePublicClient } from "wagmi";
import { contract } from "@/constants/contract";

export const createPost = async (
  data: CreatePostRequestDto
): Promise<CreatePostResponseDto> => {
  const res = await API.post("/posts/create", data);
  return res.data;
};

export const useCreatePost = () => {
  return useMutation({
    mutationFn: createPost,
  });
};

export const updatePost = async (
  data: UpdatePostRequestDto
): Promise<CreatePostResponseDto> => {
  const res = await API.put("/posts/update", data);
  return res.data;
};

export const useUpdatePost = () => {
  return useMutation({
    mutationFn: updatePost,
  });
};

// Hook to get post ID from transaction hash
export const useGetPostIdFromTransaction = () => {
  const publicClient = usePublicClient();

  const getPostIdFromTransaction = async (
    txHash: string
  ): Promise<number | null> => {
    try {
      if (!publicClient) {
        console.error("Public client not available");
        return null;
      }

      // Get transaction receipt
      const receipt = await publicClient.getTransactionReceipt({
        hash: txHash as `0x${string}`,
      });

      // Find the PostCreated event in the logs
      const postCreatedEvent = receipt.logs.find((log: any) => {
        // Check if this log is from our contract and contains PostCreated event
        return log.address.toLowerCase() === contract.post.toLowerCase();
      });

      if (postCreatedEvent && postCreatedEvent.topics[1]) {
        // Decode the event to get the post ID
        // The first indexed parameter is the post ID
        const postId = BigInt(postCreatedEvent.topics[1]);
        return Number(postId);
      }

      return null;
    } catch (error) {
      console.error("Error getting post ID from transaction:", error);
      return null;
    }
  };

  return { getPostIdFromTransaction };
};

export const createUser = async (data: any) => {
  const { token, email, walletAddress } = data;
  const res = await API.post("/api/auth", {
    token,
    email,
    walletAddress,
  });

  return res.data;
};

export const useCreateUser = () => {
  return useMutation({
    mutationFn: createUser,
  });
};
