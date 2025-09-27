import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import API from "../utils/axiosInstance";
import {
  ScoreDto,
  CreateScoreDto,
  UpdateScoreDto,
  DailyVotePercentageDto,
} from "@/utils/types";

// Step 1: Create score
export const createScore = async (data: CreateScoreDto): Promise<ScoreDto> => {
  const response = await API.post("/scores/create", data);
  return response.data;
};

export const useCreateScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createScore,
    onSuccess: (data) => {
      // Invalidate post queries to refresh score data
      if (data.postUuid) {
        queryClient.invalidateQueries({ queryKey: ["post", data.postUuid] });
      }
      // Invalidate daily vote percentage queries
      queryClient.invalidateQueries({ queryKey: ["dailyVotePercentage"] });
    },
  });
};

// Step 3: Update score with transaction hash
export const updateScore = async ({
  scoreUuid,
  txHash,
  status,
}: UpdateScoreDto): Promise<ScoreDto> => {
  const response = await API.put("/scores/update", {
    scoreUuid,
    txHash,
    status,
  });
  return response.data;
};

export const useUpdateScore = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateScore,
    onSuccess: (data) => {
      // Invalidate post queries to refresh score data
      if (data.postUuid) {
        queryClient.invalidateQueries({ queryKey: ["post", data.postUuid] });
      }
      // Invalidate daily vote percentage queries
      queryClient.invalidateQueries({ queryKey: ["dailyVotePercentage"] });
    },
  });
};

// Fetch daily vote percentage using wallet address
export const fetchDailyVotePercentage = async (
  userWalletAddress: string
): Promise<DailyVotePercentageDto> => {
  const response = await API.get(
    `/scores/daily-vote-percentage/${userWalletAddress}`
  );
  return response.data;
};

export const useDailyVotePercentage = (userWalletAddress: string) => {
  return useQuery({
    queryKey: ["dailyVotePercentage", userWalletAddress],
    queryFn: () => fetchDailyVotePercentage(userWalletAddress),
    enabled: !!userWalletAddress,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};
