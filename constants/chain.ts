/**
 * Chain configuration constants
 * Can be changed via environment variables if needed
 */

import { sonicTestnet } from "@/context/wagmi.config";

// Chain identifier - defaults to "sonic-testnet" but can be changed via env
export const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || "sonic-testnet";

// Native token symbol, sourced from the actual configured wagmi chain so it
// can't drift out of sync with CHAIN_NAME the way a string comparison could.
export const NATIVE_TOKEN_SYMBOL = sonicTestnet.nativeCurrency.symbol;

// Token display names
export const TOKEN_DISPLAY_NAMES = {
  CAT: "CAT",
  SONIC: NATIVE_TOKEN_SYMBOL,
};

// Default polling cadence for on-chain reads (balances, votes, scores, etc).
// Kept deliberately conservative — the RPC endpoint is tunneled through
// ngrok in local dev, and short intervals across many mounted components
// exhaust ngrok's request limit quickly.
export const RPC_POLL_INTERVAL_MS =
  Number(process.env.NEXT_PUBLIC_RPC_POLL_INTERVAL_MS) || 60000;

// Slower cadence for reads only used as a rare correction/edge case (e.g.
// comparing chain time to wall-clock time), not for anything user-visible.
export const RPC_BLOCK_POLL_INTERVAL_MS =
  Number(process.env.NEXT_PUBLIC_RPC_BLOCK_POLL_INTERVAL_MS) || 300000;
