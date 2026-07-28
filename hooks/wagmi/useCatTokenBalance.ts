import { useAccount } from "wagmi";
import { useReadCuratAiTokenBalanceOf } from "./contracts";
import { useContractAddresses } from "@/context/contractAddresses.provider";
import { RPC_POLL_INTERVAL_MS } from "@/constants/chain";

/**
 * Custom hook to fetch CAT token balance for the connected wallet
 * Returns the raw balance value (as BigInt) matching the post page behavior
 */
export const useCatTokenBalance = () => {
  const { address: userAddress } = useAccount();
  const { contracts } = useContractAddresses();
  const {
    data: balance,
    refetch,
    isLoading,
    error,
  } = useReadCuratAiTokenBalanceOf({
    address: contracts?.token as `0x${string}`,
    args: [userAddress as `0x${string}`],
    // The query client has refetchOnWindowFocus disabled and this hook is
    // used by components (e.g. the navbar) that stay mounted across
    // client-side navigation, so without polling the balance would freeze
    // at whatever it was on first mount and never reflect new transactions.
    // staleTime matches the interval so remounting this hook elsewhere
    // (different component, same query key) within that window reuses the
    // cached value instead of firing an extra request.
    query: {
      enabled: !!contracts,
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
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
