"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { CopyButton } from "@/components/ui/CopyButton";
import { useMyReferrals } from "@/hooks/api/referral";
import { useReferralSettingsQuery } from "@/hooks/api/settings";
import { formatDistanceToNow } from "date-fns";
import { Loader2 } from "lucide-react";
import { display } from "@/components/brutal";

// Monochrome status treatment — weight/fill communicates state, not colour.
const REWARD_STATUS_STYLES: Record<
  string,
  { label: string; className: string }
> = {
  COMPLETED: { label: "Rewarded", className: "border-[#0A0A0A] bg-[#0A0A0A] text-[#F5F4F0]" },
  PENDING: { label: "Pending", className: "border-[#0A0A0A] text-[#0A0A0A]" },
  FAILED: { label: "Failed", className: "border-[#0A0A0A]/40 text-[#0A0A0A]/50" },
};

export default function ReferralTab() {
  const { data, isLoading, isError } = useMyReferrals({ enabled: true });
  const { data: referralSettings } = useReferralSettingsQuery();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-[#0A0A0A]/50" />
        <span className="ml-3 text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/55">
          Loading referral data
        </span>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <span className={`${display} mb-3 grid h-12 w-12 place-items-center border-[1.5px] border-[#0A0A0A] text-[22px] font-black text-[#0A0A0A]`}>
          !
        </span>
        <p className="text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A]/50">
          Failed to load referral data
        </p>
      </div>
    );
  }

  const bonusAmount = referralSettings?.referalBonusAmount;
  const referralsDisabled = referralSettings?.isReferralActive === false;

  return (
    <div className="space-y-10">
      {/* Refer & earn — ledger block */}
      <div className="border-t border-[color:var(--border)] pt-8">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A]/55">
              Refer &amp; earn
            </p>
            <h2 className={`${display} mt-2 text-2xl font-black uppercase tracking-tight text-[#0A0A0A]`}>
              Refer friends, earn CAT
            </h2>
            <p className="mt-2 max-w-md text-[13px] text-[#0A0A0A]/55">
              {bonusAmount
                ? `Earn ${bonusAmount} CAT for every friend who signs up with your link.`
                : "Share your link and earn CAT for every friend who signs up."}
            </p>
          </div>
          {typeof data.totalEarnedCat === "number" && (
            <div className="shrink-0 text-right">
              <p className={`${display} text-[32px] font-black leading-none tracking-tight text-[#0A0A0A] tabular-nums`}>
                {data.totalEarnedCat}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-[#0A0A0A]/45">
                CAT earned
              </p>
            </div>
          )}
        </div>

        {referralsDisabled && (
          <div className="mb-5 border border-[#0A0A0A] bg-[#0A0A0A]/[0.04] px-4 py-2.5 text-[12px] text-[#0A0A0A]/70">
            Referral rewards are temporarily paused. Your link still works, but
            new signups won&apos;t earn a reward right now.
          </div>
        )}

        <div className="flex items-center gap-2 border border-[#0A0A0A] px-4 py-3">
          <code className="flex-1 truncate font-mono text-[13px] text-[#0A0A0A]">
            {data.referralLink}
          </code>
          <CopyButton
            value={data.referralLink}
            label="Copy"
            className="shrink-0 rounded-none border border-[#0A0A0A] bg-transparent px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A] transition-colors duration-150 hover:bg-[#0A0A0A] hover:text-[#F5F4F0]"
          />
        </div>
      </div>

      {/* Referred users */}
      <div className="border-t border-[color:var(--border)] pt-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#0A0A0A]/55">
          People you&apos;ve referred ({data.referredUsers.length})
        </p>

        {data.referredUsers.length === 0 ? (
          <div className="py-14 text-center">
            <p className="text-[11px] uppercase tracking-[0.16em] text-[#0A0A0A]/45">
              No referrals yet — share your link to start earning
            </p>
          </div>
        ) : (
          <div className="mt-5 border-t border-[color:var(--border)]">
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
                  className="flex items-center justify-between gap-3 border-b border-[color:var(--border)] py-3.5"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar className="h-9 w-9">
                      {referred.profilePic && (
                        <AvatarImage src={referred.profilePic} />
                      )}
                      <AvatarFallback className="bg-[#0A0A0A]/10 text-[11px] font-bold text-[#0A0A0A]">
                        {displayName.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className={`${display} truncate text-[13px] font-bold text-[#0A0A0A]`}>
                        {displayName}
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A]/45">
                        Joined{" "}
                        {formatDistanceToNow(new Date(referred.joinedAt), {
                          addSuffix: true,
                        })}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 whitespace-nowrap border px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] ${statusStyle.className}`}
                  >
                    {statusStyle.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
