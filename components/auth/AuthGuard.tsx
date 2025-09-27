"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Spinner from "@/components/ui/Spinner";
import { useAuth } from "@/hooks/useAuth";

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const { isLoading, isAuthenticated, checkAuth } = useAuth();
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname, checkAuth]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center space-y-4">
          <Spinner />
          <p className="text-gray-600">Verifying authentication...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Router will handle redirect
  }

  return <>{children}</>;
};

export default AuthGuard;
