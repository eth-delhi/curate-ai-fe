import { useQuery } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

export interface ContractAddresses {
  role: string;
  token: string;
  post: string;
  vote: string;
  settle: string;
}

export const getContractAddresses = () =>
  API.get<ContractAddresses>("/settings/contracts").then((res) => res.data);

export const useContractAddressesQuery = () =>
  useQuery({
    queryKey: ["contract-addresses"],
    queryFn: getContractAddresses,
    staleTime: Infinity,
  });

export const getRpcUrl = () =>
  API.get<{ url: string }>("/settings/rpc-url").then((res) => res.data.url);

// Unlike contract addresses, the RPC URL is expected to rotate (e.g. a
// dev-only ngrok tunnel), so this refetches periodically instead of caching
// forever, matching the backend's own short-TTL cache in getRpcUrl.ts.
export const useRpcUrlQuery = () =>
  useQuery({
    queryKey: ["rpc-url"],
    queryFn: getRpcUrl,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });

export interface ReferralSettings {
  isReferralActive: boolean;
  referalBonusAmount: number;
}

export const getReferralSettings = () =>
  API.get<ReferralSettings>("/settings/referral").then((res) => res.data);

// Mirrors the backend's own short-TTL cache, so a kill-switch flip in the
// DB is reflected here within a minute without a page reload.
export const useReferralSettingsQuery = () =>
  useQuery({
    queryKey: ["referral-settings"],
    queryFn: getReferralSettings,
    staleTime: 60_000,
    refetchInterval: 60_000,
  });
