/**
 * Chain configuration constants
 * Can be changed via environment variables if needed
 */

// Chain identifier - defaults to "sonic-testnet" but can be changed via env
export const CHAIN_NAME = process.env.NEXT_PUBLIC_CHAIN_NAME || "sonic-testnet";

// Token contract addresses
export const TOKEN_CONTRACTS = {
  CAT:
    process.env.NEXT_PUBLIC_CAT_TOKEN_ADDRESS ||
    "0xAdba82bc3B5170B272E4c17C52572c2C142d42A0",
  // Add other token addresses as needed
};

// Native token symbol based on chain
export const NATIVE_TOKEN_SYMBOL = CHAIN_NAME === "sonic-testnet" ? "S" : "ETH";

// Token display names
export const TOKEN_DISPLAY_NAMES = {
  CAT: "CAT",
  SONIC: NATIVE_TOKEN_SYMBOL,
};
