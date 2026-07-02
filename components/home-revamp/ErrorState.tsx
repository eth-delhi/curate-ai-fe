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
    <div className="flex h-screen bg-muted items-center justify-center">
      <div className="text-center">
        <p className="text-destructive mb-4">{message}</p>
        <p className="text-muted-foreground text-sm">
          {error?.message || "An error occurred while fetching posts"}
        </p>
      </div>
    </div>
  );
};
