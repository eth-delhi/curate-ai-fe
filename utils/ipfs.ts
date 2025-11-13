/**
 * IPFS utility functions
 * Centralized helpers for working with IPFS hashes and URLs
 */

/**
 * Get IPFS URL from hash using Pinata gateway
 * @param hash - IPFS hash (e.g., "QmABC123...")
 * @returns Full IPFS gateway URL or null if hash is empty
 */
export function getIpfsUrl(hash?: string | null): string | null {
  if (!hash) return null;
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
}

/**
 * Extract IPFS hash from a full IPFS URL
 * @param url - Full IPFS URL (e.g., "https://gateway.pinata.cloud/ipfs/QmABC123...")
 * @returns IPFS hash or null if URL is invalid
 */
export function extractIpfsHash(url: string): string | null {
  const match = url.match(/\/ipfs\/([^\/\?#]+)/);
  return match ? match[1] : null;
}

/**
 * Check if a URL is an IPFS gateway URL
 * @param url - URL to check
 * @returns true if URL is an IPFS gateway URL
 */
export function isIpfsUrl(url: string): boolean {
  return url.includes("gateway.pinata.cloud/ipfs/");
}

