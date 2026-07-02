"use client";

import Spinner from "@/components/ui/Spinner";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({
  message = "Loading posts...",
}: LoadingStateProps) => {
  return (
    <div className="flex h-screen bg-muted items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
