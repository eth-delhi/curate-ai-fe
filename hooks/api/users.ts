import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import API from "../utils/axiosInstance";

export interface UserWalletLookup {
  uuid: string;
  username: string;
  walletAddress: string;
}

// A 404 here means "valid lookup, no match" — not an error state — so the
// UI can branch on `data === null` instead of `isError`.
const getOrNull = async (url: string): Promise<UserWalletLookup | null> => {
  try {
    const response = await API.get<UserWalletLookup>(url);
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      return null;
    }
    throw error;
  }
};

export const getWalletByUsername = (username: string) =>
  getOrNull(`/users/wallet-by-username/${encodeURIComponent(username)}`);

export const useWalletByUsername = (
  username: string,
  options: { enabled?: boolean } = {}
) =>
  useQuery({
    queryKey: ["wallet-by-username", username],
    queryFn: () => getWalletByUsername(username),
    enabled: (options.enabled ?? true) && username.trim().length > 0,
    retry: false,
    staleTime: 30_000,
  });

export const getUsernameByWallet = (walletAddress: string) =>
  getOrNull(`/users/username-by-wallet/${encodeURIComponent(walletAddress)}`);

export const useUsernameByWallet = (
  walletAddress: string,
  options: { enabled?: boolean } = {}
) =>
  useQuery({
    queryKey: ["username-by-wallet", walletAddress],
    queryFn: () => getUsernameByWallet(walletAddress),
    enabled: (options.enabled ?? true) && walletAddress.trim().length > 0,
    retry: false,
    staleTime: 30_000,
  });
