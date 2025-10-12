"use client";

interface ErrorStateProps {
  error?: Error | null;
  message?: string;
}

export const ErrorState = ({
  error,
  message = "Failed to load posts",
}: ErrorStateProps) => {
  return (
    <div className="flex h-screen bg-[#e8e7ed] items-center justify-center">
      <div className="text-center">
        <p className="text-red-600 mb-4">{message}</p>
        <p className="text-gray-600 text-sm">
          {error?.message || "An error occurred while fetching posts"}
        </p>
      </div>
    </div>
  );
};
