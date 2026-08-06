import { useAccount, useReadContract } from "wagmi";
import { useContractAddresses } from "@/context/contractAddresses.provider";
import { RPC_POLL_INTERVAL_MS } from "@/constants/chain";

// token.sol exposes votePowerOf(account) — the balance an account held at the
// *start of the current day*, which is what vote.sol actually enforces
// (`amount <= votePowerOf(msg.sender)`), not the live balanceOf. Tokens
// received today carry no voting power until the next day, which stops the
// "vote, transfer to a fresh wallet, vote again" loophole.
//
// The token ABI the codegen pulls from the backend is still stale (no
// votePowerOf), so read it with a minimal inline fragment instead of the
// generated hook. Drop this in favour of useReadCuratAiTokenVotePowerOf once
// the backend's Settings ABI is refreshed and `wagmi generate` is re-run.
const votePowerAbi = [
  {
    type: "function",
    name: "votePowerOf",
    stateMutability: "view",
    inputs: [{ name: "account", type: "address" }],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/**
 * Voting power (in whole CAT units) available to the connected wallet today.
 * Mirrors useCatTokenBalance's fetching pattern (poll + matching staleTime) so
 * it stays live and dedupes across components.
 */
export const useCatVotePower = () => {
  const { address: userAddress } = useAccount();
  const { contracts } = useContractAddresses();

  const {
    data: votePower,
    refetch,
    isLoading,
    error,
  } = useReadContract({
    abi: votePowerAbi,
    address: contracts?.token as `0x${string}`,
    functionName: "votePowerOf",
    args: userAddress ? [userAddress] : undefined,
    query: {
      enabled: !!contracts && !!userAddress,
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
  });

  return {
    votePower: votePower as bigint | undefined,
    refetch,
    isLoading,
    error,
    userAddress,
  };
};
