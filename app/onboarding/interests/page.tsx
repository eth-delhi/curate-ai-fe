"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import AuthGuard from "@/components/auth/AuthGuard";
import { useTopTags, useSetUserInterests } from "@/hooks/api/tags";
import { markInterestsOnboardingSeen } from "@/utils/onboarding";
import showToast from "@/utils/showToast";
import { cn } from "@/lib/utils";

const MIN_INTERESTS = 5;
const MAX_INTERESTS = 10;

function InterestsPicker() {
  const router = useRouter();
  const { data: tags, isLoading } = useTopTags({ limit: 30 });
  const { mutateAsync, isPending } = useSetUserInterests();
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleTag = (uuid: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(uuid)) {
        next.delete(uuid);
      } else if (next.size < MAX_INTERESTS) {
        next.add(uuid);
      } else {
        showToast({
          message: `You can select up to ${MAX_INTERESTS} topics`,
          type: "info",
        });
      }
      return next;
    });
  };

  const handleSubmit = async () => {
    if (selected.size < MIN_INTERESTS) {
      showToast({
        message: `Select at least ${MIN_INTERESTS} topics to continue`,
        type: "error",
      });
      return;
    }

    try {
      await mutateAsync(Array.from(selected));
      markInterestsOnboardingSeen();
      router.push("/home");
    } catch (error) {
      console.error("Failed to save interests:", error);
      showToast({
        message: "Failed to save your interests. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-2xl py-16">
        <div className="mb-10 text-center">
          <span className="font-mono text-xs tracking-widest text-primary uppercase">
            One quick step
          </span>
          <h1 className="text-3xl font-serif font-black mt-3 mb-2 text-foreground">
            What are you into?
          </h1>
          <p className="text-sm text-muted-foreground">
            Pick {MIN_INTERESTS}-{MAX_INTERESTS} topics — we&apos;ll use them
            to shape your feed.
          </p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5 justify-center mb-10">
            {tags?.map((tag) => {
              const isSelected = selected.has(tag.uuid);
              return (
                <button
                  key={tag.uuid}
                  type="button"
                  onClick={() => toggleTag(tag.uuid)}
                  className="cursor-pointer"
                >
                  <Badge
                    variant={isSelected ? "default" : "outline"}
                    className={cn(
                      "px-4 py-1.5 text-sm gap-1.5 transition-colors",
                      isSelected && "hover:bg-primary/90"
                    )}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5" />}#{tag.name}
                  </Badge>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-col items-center gap-4">
          <Button
            onClick={handleSubmit}
            disabled={isPending || selected.size < MIN_INTERESTS}
            className="w-full max-w-xs h-11 rounded-full"
          >
            {isPending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              `Continue (${selected.size}/${MAX_INTERESTS})`
            )}
          </Button>
          <button
            type="button"
            onClick={() => {
              markInterestsOnboardingSeen();
              router.push("/home");
            }}
            className="text-xs text-muted-foreground hover:text-foreground underline transition-colors duration-150 cursor-pointer"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingInterestsPage() {
  return (
    <AuthGuard>
      <InterestsPicker />
    </AuthGuard>
  );
}
