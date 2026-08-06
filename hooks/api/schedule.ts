import { useQuery } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

// Next scheduled AI-vote cron run, provided by the backend so the client
// doesn't have to know the cron cadence (it's */5 during testing but becomes
// 24h in production — driving off an absolute timestamp keeps the frontend
// agnostic to the interval).
export interface NextVoteDto {
  /** ISO timestamp of the next AI-vote cron run. */
  nextRunAt: string;
  /** ISO timestamp of the server's current time — used to correct client clock skew. */
  serverNow: string;
  /** Cron interval in seconds (5m today, 24h later). Optional, for display only. */
  intervalSeconds?: number;
}

export const fetchNextVote = async (): Promise<NextVoteDto> => {
  const response = await API.get("/schedule/next-vote");
  return response.data;
};

export const useNextVote = () =>
  useQuery({
    queryKey: ["nextVote"],
    queryFn: fetchNextVote,
    // The countdown itself is driven client-side; we only resync periodically
    // to catch schedule changes and correct drift, plus on focus after a long
    // idle (a 24h countdown may sit open all day).
    staleTime: 60 * 1000,
    refetchOnWindowFocus: true,
  });
