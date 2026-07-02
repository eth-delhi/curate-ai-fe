"use client";

export const AuthDivider = () => {
  return (
    <div className="relative flex items-center justify-center my-6">
      <div className="absolute inset-0 flex items-center">
        <div className="w-full border-t border-border"></div>
      </div>
      <div className="relative px-4 bg-background text-sm text-muted-foreground rounded-md">
        Or continue with
      </div>
    </div>
  );
};
