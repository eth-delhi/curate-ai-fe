"use client";

import Spinner from "@/components/ui/Spinner";

interface LoadingStateProps {
  message?: string;
}

export const LoadingState = ({
  message = "Loading posts...",
}: LoadingStateProps) => {
  return (
    <div className="flex h-screen bg-[#e8e7ed] items-center justify-center">
      <div className="text-center">
        <Spinner />
        <p className="mt-4 text-gray-600">{message}</p>
      </div>
    </div>
  );
};
