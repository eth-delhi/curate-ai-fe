import { useAccount } from "wagmi";
import { useReadCuratAiTokenBalanceOf } from "./contracts";
import { contract } from "@/constants/contract";

/**
 * Custom hook to fetch CAT token balance for the connected wallet
 * Returns the raw balance value (as BigInt) matching post-revamp behavior
 */
export const useCatTokenBalance = () => {
  const { address: userAddress } = useAccount();

  const {
    data: balance,
    refetch,
    isLoading,
    error,
  } = useReadCuratAiTokenBalanceOf({
    address: contract.token as `0x${string}`,
    args: [userAddress as `0x${string}`],
  });

  return {
    balance,
    balanceFormatted: balance?.toString() || "0",
    refetch,
    isLoading,
    error,
    userAddress,
  };
};
