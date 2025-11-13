"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAccount, useWriteContract } from "wagmi";
import { useCreateScore, useUpdateScore } from "@/hooks/api/scores";
import { showToast } from "@/utils/showToast";
import { Star, Loader2 } from "lucide-react";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { useWriteCurateAiVoteVote } from "@/hooks/wagmi/contracts";

interface ScoreButtonProps {
  postUuid: string;
  postInternalId: string;
  currentScore?: number;
  onScoreChange?: (newScore: number) => void;
}

export const ScoreButton: React.FC<ScoreButtonProps> = ({
  postUuid,
  postInternalId,
  currentScore = 0,
  onScoreChange,
}) => {
  const { address: userAddress } = useAccount();
  const [score, setScore] = useState(currentScore);
  const [isScoring, setIsScoring] = useState(false);

  // API hooks
  const createScoreMutation = useCreateScore(postUuid);
  const updateScoreMutation = useUpdateScore(postUuid);

  // Blockchain hooks
  const { balance: tokenBalance } = useCatTokenBalance();

  const { writeContractAsync } = useWriteCurateAiVoteVote();

  const handleScore = async (quantity: number) => {
    if (!userAddress) {
      showToast("Please connect your wallet to score posts", "error");
      return;
    }

    if (!tokenBalance || tokenBalance < BigInt(quantity)) {
      showToast("Insufficient token balance", "error");
      return;
    }

    setIsScoring(true);

    try {
      // Step 1: Create score in database
      const scoreData = await createScoreMutation.mutateAsync({
        postUuid,
        userWalletAddress: userAddress,
        quantity,
      });

      // Step 2: Execute blockchain transaction
      const txResult = await writeContractAsync({
        args: [BigInt(postInternalId), BigInt(quantity)],
      });

      const txHash = txResult as string;

      // Step 3: Update score with transaction hash
      await updateScoreMutation.mutateAsync({
        scoreUuid: scoreData.uuid,
        txHash,
      });

      // Update local state
      const newScore = score + quantity;
      setScore(newScore);
      onScoreChange?.(newScore);

      showToast(`Successfully scored ${quantity} points!`, "success");
    } catch (error) {
      console.error("Scoring error:", error);
      showToast("Failed to score post. Please try again.", "error");
    } finally {
      setIsScoring(false);
    }
  };

  const handleScore1 = () => handleScore(1);
  const handleScore5 = () => handleScore(5);
  const handleScore10 = () => handleScore(10);

  if (!userAddress) {
    return (
      <div className="flex items-center gap-2">
        <Star className="h-5 w-5 text-gray-400" />
        <span className="text-sm text-gray-600">Connect wallet to score</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        <Star className="h-4 w-4 text-yellow-500" />
        <span className="text-sm font-medium">{score}</span>
      </div>

      <div className="flex items-center gap-1">
        <Button
          size="sm"
          variant="outline"
          onClick={handleScore1}
          disabled={isScoring}
          className="h-8 px-2 text-xs"
        >
          {isScoring ? <Loader2 className="h-3 w-3 animate-spin" /> : "+1"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleScore5}
          disabled={isScoring}
          className="h-8 px-2 text-xs"
        >
          {isScoring ? <Loader2 className="h-3 w-3 animate-spin" /> : "+5"}
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={handleScore10}
          disabled={isScoring}
          className="h-8 px-2 text-xs"
        >
          {isScoring ? <Loader2 className="h-3 w-3 animate-spin" /> : "+10"}
        </Button>
      </div>

      {tokenBalance && (
        <div className="text-xs text-gray-500">
          Balance: {tokenBalance.toString()}
        </div>
      )}
    </div>
  );
};
