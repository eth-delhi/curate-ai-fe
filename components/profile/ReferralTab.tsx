"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CopyButton } from "@/components/ui/CopyButton";
import { useMyReferrals } from "@/hooks/api/referral";
import { useReferralSettingsQuery } from "@/hooks/api/settings";
import { formatDistanceToNow } from "date-fns";
import { AlertCircle, Gift, Loader2, Users } from "lucide-react";

const REWARD_STATUS_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  COMPLETED: {
    label: "Rewarded",
    className: "bg-green-500/10 text-green-600 border-green-500/20",
  },
  PENDING: {
    label: "Pending",
    className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  },
  FAILED: {
    label: "Failed",
    className: "bg-red-500/10 text-red-600 border-red-500/20",
  },
};

export default function ReferralTab() {
  const { data, isLoading, isError } = useMyReferrals({ enabled: true });
  const { data: referralSettings } = useReferralSettingsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        <span className="ml-3 text-muted-foreground">
          Loading referral data...
        </span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-muted-foreground">Failed to load referral data</p>
      </div>
    );
  }

  const bonusAmount = referralSettings?.referalBonusAmount;
  const referralsDisabled = referralSettings?.isReferralActive === false;

  return (
    <div className="space-y-6">
      {/* Referral link card */}
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
              <Gift className="w-5 h-5 text-primary" />
              Refer friends, earn CAT
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              {bonusAmount
                ? `Earn ${bonusAmount} CAT for every friend who signs up with your link.`
                : "Share your link and earn CAT for every friend who signs up."}
            </p>
          </div>
          {typeof data.totalEarnedCat === "number" && (
            <div className="text-right shrink-0">
              <p className="text-2xl font-bold text-foreground">
                {data.totalEarnedCat}
              </p>
              <p className="text-xs text-muted-foreground">CAT earned</p>
            </div>
          )}
        </div>

        {referralsDisabled && (
          <div className="mb-4 rounded-lg border border-yellow-500/20 bg-yellow-500/10 px-4 py-2.5 text-sm text-yellow-700">
            Referral rewards are temporarily paused. Your link still works,
            but new signups won&apos;t earn a reward right now.
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-4 py-3">
          <code className="flex-1 truncate text-sm text-foreground font-mono">
            {data.referralLink}
          </code>
          <CopyButton
            value={data.referralLink}
            label="Copy"
            className="shrink-0 rounded-md border border-border bg-background px-3 py-1.5 hover:bg-accent"
          />
        </div>
      </div>

      {/* Referred users list */}
      <div className="rounded-xl border border-border bg-background p-6 shadow-sm sm:p-8">
        <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-muted-foreground" />
          People you&apos;ve referred ({data.referredUsers.length})
        </h3>

        {data.referredUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10">
            <Users className="w-10 h-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground text-sm">
              No referrals yet — share your link to start earning.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {data.referredUsers.map((referred) => {
              const statusStyle =
                REWARD_STATUS_STYLES[referred.rewardStatus] ??
                REWARD_STATUS_STYLES.PENDING;
              const displayName =
                referred.username ??
                `${referred.walletAddress.slice(0, 6)}...${referred.walletAddress.slice(-4)}`;

              return (
                <div
                  key={referred.uuid}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9">
                      {referred.profilePic && (
                        <AvatarImage src={referred.profilePic} />
                      )}
                      <AvatarFallback>
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">
                        {displayName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Joined{" "}
                        {formatDistanceToNow(new Date(referred.joinedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={statusStyle.className}
                  >
                    {statusStyle.label}
                  </Badge>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
