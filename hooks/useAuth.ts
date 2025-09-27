"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import API from "@/hooks/utils/axiosInstance";
import { showToast } from "@/utils/showToast";
import { useMagicState } from "@/context/magic.provider";
import { useMagic } from "@/hooks/MagicProvider";

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: null,
  });
  const { setToken } = useMagicState();
  const { magic } = useMagic();
  const router = useRouter();

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
    []
  );

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
      logout();
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("accessToken");
    setAuthState({
      isAuthenticated: false,
      isLoading: false,
      token: null,
    });
    setToken("");
    router.push("/auth");
  }, [router]);

  const checkAuth = useCallback(async () => {
    try {
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
      logout();
    }
  }, [checkTokenValidity, logout, router]);

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
