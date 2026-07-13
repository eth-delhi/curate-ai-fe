"use client";

import { Loader2 } from "lucide-react";
import { IoChevronUpCircle } from "react-icons/io5";
import { RightSidebarProps } from "@/types/home-revamp";
import { useAccount } from "wagmi";
import { useDailyVotePercentage } from "@/hooks/api/scores";

const DAILY_VOTE_CAP = 500;

// Voting Power Widget — daily upvote allowance, in the same flat/editorial
// style as the "Total Balance" stat it replaced (big serif number, thin
// border accent), not a dashboard-style gauge.
const VotingPowerWidget = () => {
  const { address } = useAccount();
  const { data: dailyVoteData, isLoading } = useDailyVotePercentage(
    address || ""
  );

  if (!address) {
    return (
      <div>
        <h3 className="font-serif text-base font-semibold mb-4 text-foreground">
          Voting Power
        </h3>
        <div className="border-l-2 border-border pl-4">
          <p className="text-[13px] text-muted-foreground">
            Sign in to see your daily voting power.
          </p>
        </div>
      </div>
    );
  }

  const used = dailyVoteData?.totalVotePercentage ?? 0;
  const voteCount = dailyVoteData?.voteCount ?? 0;
  const percentage = Math.min(100, Math.round((used / DAILY_VOTE_CAP) * 100));
  const remaining = Math.max(0, DAILY_VOTE_CAP - used);

  return (
    <div>
      <h3 className="font-serif text-base font-semibold mb-4 text-foreground">
        Voting Power
      </h3>
      <div className="border-l-2 border-border pl-4">
        {isLoading ? (
          <div className="flex items-center py-2">
            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <p className="text-[13px] text-muted-foreground mb-1">
              Used today
            </p>
            <p className="text-[32px] font-semibold text-foreground mb-2">
              {percentage}%
            </p>
            <div className="h-1 w-full rounded-full bg-muted overflow-hidden mb-3">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
                style={{ width: `${percentage}%` }}
              />
            </div>

            {voteCount === 0 ? (
              <p className="text-[13px] text-muted-foreground">
                Upvote a post to fill your daily power.
              </p>
            ) : (
              <>
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-foreground flex items-center gap-1.5">
                    <IoChevronUpCircle className="w-3.5 h-3.5 text-muted-foreground" />
                    Votes today
                  </span>
                  <span className="text-muted-foreground">{voteCount}</span>
                </div>
                <div className="flex justify-between py-1.5 text-sm">
                  <span className="text-foreground">Remaining</span>
                  <span className="text-muted-foreground">
                    {remaining} / {DAILY_VOTE_CAP}
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export const LeftSidebar = ({
  onTopicClick,
  selectedTag,
}: Pick<RightSidebarProps, "onTopicClick"> & {
  selectedTag?: string | null;
}) => {
  void onTopicClick;
  void selectedTag;

  return (
    <div className="w-[220px] shrink-0">
      <VotingPowerWidget />
    </div>
  );
};
