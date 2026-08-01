import { useQuery } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

export interface ReferredUser {
  uuid: string;
  walletAddress: string;
  username: string | null;
  profilePic: string | null;
  joinedAt: string;
  rewardStatus: "PENDING" | "COMPLETED" | "FAILED";
}

export interface MyReferrals {
  referralLink: string;
  walletAddress: string;
  totalEarnedCat: number;
  referredUsers: ReferredUser[];
}

export const getMyReferrals = () =>
  API.get<MyReferrals>("/users/me/referrals").then((res) => res.data);

export const useMyReferrals = (options?: { enabled?: boolean }) =>
  useQuery({
    queryKey: ["my-referrals"],
    queryFn: getMyReferrals,
    enabled: options?.enabled,
    staleTime: 30_000,
  });
