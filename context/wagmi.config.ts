"use client";

import { useState, useEffect } from "react";
import { http, createConfig, useDisconnect } from "wagmi";
import { dedicatedWalletConnector } from "@magiclabs/wagmi-connector";
import {
  getNetworkUrl,
  getChainId,
  getNetworkName,
  getNetworkToken,
} from "@/lib/network";
import { useRpcUrl } from "@/context/rpcUrl.provider";

// Single source of truth for the RPC URL/chain id, shared with the Magic
// auth SDK instance (hooks/MagicProvider.tsx) via lib/network.ts, so wagmi
// can't end up pointed at a different network than the one used for login.
const nativeToken = getNetworkToken();
const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_URL;

// Static export kept for consumers (constants/chain.ts's NATIVE_TOKEN_SYMBOL)
// that only need chain metadata, not the live RPC URL — its rpcUrls field
// uses the env/localhost fallback and is not used for actual network calls.
// useWagmiConfig() below builds its own DB-rpcUrl-aware chain config for
// that purpose.
export const sonicTestnet = {
  id: getChainId(),
  name: getNetworkName(),
  nativeCurrency: { decimals: 18, name: nativeToken, symbol: nativeToken },
  rpcUrls: { default: { http: [getNetworkUrl()] } },
  // Omit entirely when there's no explorer configured (e.g. a local node)
  // rather than pointing at a blank/broken URL.
  ...(explorerUrl
    ? {
        blockExplorers: {
          default: { name: `${getNetworkName()} Explorer`, url: explorerUrl },
        },
      }
    : {}),
  testnet: true,
};

export function useWagmiConfig() {
  const [config, setConfig] = useState<any>(null);
  const { rpcUrl } = useRpcUrl();

  useEffect(() => {
    // Wait for the DB-backed RPC URL (GET /settings/rpc-url) before building
    // the client — the tunnel URL rotates, so wagmi must not construct its
    // transport against a stale/undefined endpoint.
    // if (!rpcUrl) return; // TEMP offline preview — REVERT before commit

    const resolvedUrl = getNetworkUrl(rpcUrl);
    const chain = {
      ...sonicTestnet,
      rpcUrls: { default: { http: [resolvedUrl] } },
    };

    const wagmiConfig = createConfig({
      multiInjectedProviderDiscovery: false,
      storage: null,
      // Combine simultaneous contract reads into one multicall RPC request
      // instead of one request per hook.
      batch: { multicall: true },
      // Default refetch/watch cadence for any hook that doesn't set its own
      // refetchInterval (wagmi/viem otherwise default to 4s, which floods
      // the ngrok-tunneled RPC endpoint in local dev).
      pollingInterval: 60_000,
      chains: [chain],
      connectors: [
        dedicatedWalletConnector({
          chains: [chain],
          options: {
            apiKey: process.env.NEXT_PUBLIC_MAGIC_API_KEY as string,
            magicSdkConfiguration: {
              network: {
                rpcUrl: resolvedUrl,
                chainId: getChainId(),
              },
            },
          },
        }),
      ],
      transports: {
        // ngrok's free tier serves an HTML "you are about to visit" warning
        // page in place of the actual response unless this header is set,
        // for every plain (non-browser-navigated) request. Without it every
        // RPC call gets back that HTML page instead of JSON-RPC, which
        // viem's http transport treats as a failure and retries (default
        // retryCount: 3) — silently multiplying request volume on top of
        // the polling interval, and wallet auto-connect never succeeds.
        [chain.id]: http(resolvedUrl, {
          fetchOptions: {
            headers: { "ngrok-skip-browser-warning": "true" },
          },
          // Don't amplify a bad/rate-limited endpoint into 4x the request
          // count — viem defaults to retrying failed calls 3x with backoff,
          // which is exactly what turns "the tunnel is down" into "the
          // tunnel gets hammered while it's down".
          retryCount: 0,
        }),
      },
    });

    setConfig(wagmiConfig);
  }, [rpcUrl]);

  return config;
}
