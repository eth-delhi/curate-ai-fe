"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import API from "@/hooks/utils/axiosInstance";
import { showToast } from "@/utils/showToast";
import { useMagicState } from "@/context/magic.provider";
import { useMagic } from "@/hooks/MagicProvider";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

// Public routes that don't require authentication
const PUBLIC_ROUTES = ["/auth", "/post-revamp", "/post/", "/home-revamp", "/"];

// Check if current path is a public route
const isPublicRoute = (pathname: string): boolean => {
  return PUBLIC_ROUTES.some((route) => {
    if (route.endsWith("/")) {
      return pathname.startsWith(route);
    }
    return pathname === route || pathname.startsWith(route + "/");
  });
};

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });
  const { setToken } = useMagicState();
  const { magic } = useMagic();
  const router = useRouter();
  const pathname = usePathname();

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      token: null,
    });
    setToken("");
    router.push("/auth");
  }, [router, setToken]);

  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      const res = await API.post("/auth/refresh", {});

      const newAccessToken = res.data.access_token;
      localStorage.setItem("accessToken", newAccessToken);
      setAuthState((prev) => ({ ...prev, token: newAccessToken }));
      console.log("Token refreshed successfully");
      return true;
    } catch (error) {
      console.error("Error refreshing token:", error);
      // Don't auto-logout on public routes
      if (!isPublicRoute(pathname || "")) {
        logout();
      }
      return false;
    }
  }, [logout, pathname]);

  const checkTokenValidity = useCallback(
    async (token: string): Promise<boolean> => {
      try {
        // Try to decode the JWT to check if it's expired
        const payload = JSON.parse(atob(token.split(".")[1]));
        const currentTime = Date.now() / 1000;

        // If token is expired, try to refresh
        if (payload.exp < currentTime) {
          return await refreshToken();
        }

        return true;
      } catch (error) {
        console.error("Error checking token validity:", error);
        return false;
      }
    },
    [refreshToken]
  );

  const checkAuth = useCallback(async () => {
    try {
      // Skip auth check for public routes
      if (pathname && isPublicRoute(pathname)) {
        const token = localStorage.getItem("accessToken");
        setAuthState({
          isAuthenticated: !!token,
          isLoading: false,
          token: token,
        });
        return;
      }

      const token = localStorage.getItem("accessToken");

      if (!token) {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          token: null,
        });
        router.push("/auth");
        return;
      }

      const isValid = await checkTokenValidity(token);

      setAuthState({
        isAuthenticated: isValid,
        isLoading: false,
        token: isValid ? token : null,
      });

      if (!isValid) {
        showToast({
          message: "Session expired. Please log in again.",
          type: "warning",
        });
        router.push("/auth");
      }
    } catch (error) {
      console.error("Authentication check failed:", error);
      // Don't auto-logout on public routes
      if (!isPublicRoute(pathname || "")) {
        logout();
      } else {
        setAuthState({
          isAuthenticated: false,
          isLoading: false,
          token: null,
        });
      }
    }
  }, [checkTokenValidity, logout, router, pathname]);

  const login = useCallback((token: string) => {
    localStorage.setItem("accessToken", token);
    setAuthState({
      isAuthenticated: true,
      isLoading: false,
      token,
    });
  }, []);

  const getCurrentUserWallet = useCallback(async (): Promise<string | null> => {
    try {
      if (!magic) return null;

      const userInfo = await magic.user.getInfo();
      return userInfo?.publicAddress || null;
    } catch (error) {
      console.error("Error getting user wallet address:", error);
      return null;
    }
  }, [magic]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return {
    ...authState,
    checkAuth,
    login,
    logout,
    refreshToken,
    getCurrentUserWallet,
  };
};
