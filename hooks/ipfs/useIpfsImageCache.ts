import { useCallback } from "react";

/**
 * Hook for managing IPFS image cache
 * Provides utilities to check cache status and manually clear cache
 */
export function useIpfsImageCache() {
  /**
   * Check if an IPFS image URL is cached
   */
  const isCached = useCallback(async (imageUrl: string): Promise<boolean> => {
    if (typeof window === "undefined" || !("caches" in window)) {
      return false;
    }

    try {
      const cache = await caches.open("ipfs-images-v1");
      const cached = await cache.match(imageUrl);
      return !!cached;
    } catch (error) {
      console.error("[useIpfsImageCache] Error checking cache:", error);
      return false;
    }
  }, []);

  /**
   * Clear a specific image from cache
   */
  const clearImageCache = useCallback(
    async (imageUrl: string): Promise<void> => {
      if (typeof window === "undefined" || !("caches" in window)) {
        return;
      }

      try {
        const cache = await caches.open("ipfs-images-v1");
        await cache.delete(imageUrl);
        console.log("[useIpfsImageCache] Cleared cache for:", imageUrl);
      } catch (error) {
        console.error("[useIpfsImageCache] Error clearing cache:", error);
      }
    },
    []
  );

  /**
   * Clear all IPFS image cache
   */
  const clearAllCache = useCallback(async (): Promise<void> => {
    if (typeof window === "undefined" || !("caches" in window)) {
      return;
    }

    try {
      const cacheNames = await caches.keys();
      const ipfsCaches = cacheNames.filter((name) =>
        name.startsWith("ipfs-images-")
      );

      await Promise.all(ipfsCaches.map((name) => caches.delete(name)));
      console.log("[useIpfsImageCache] Cleared all IPFS image cache");
    } catch (error) {
      console.error("[useIpfsImageCache] Error clearing all cache:", error);
    }
  }, []);

  /**
   * Get cache size information (approximate)
   */
  const getCacheInfo = useCallback(async (): Promise<{
    cacheNames: string[];
    totalCaches: number;
  }> => {
    if (typeof window === "undefined" || !("caches" in window)) {
      return { cacheNames: [], totalCaches: 0 };
    }

    try {
      const cacheNames = await caches.keys();
      const ipfsCaches = cacheNames.filter((name) =>
        name.startsWith("ipfs-images-")
      );

      return {
        cacheNames: ipfsCaches,
        totalCaches: ipfsCaches.length,
      };
    } catch (error) {
      console.error("[useIpfsImageCache] Error getting cache info:", error);
      return { cacheNames: [], totalCaches: 0 };
    }
  }, []);

  return {
    isCached,
    clearImageCache,
    clearAllCache,
    getCacheInfo,
  };
}

