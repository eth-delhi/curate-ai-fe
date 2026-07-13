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

// Single source of truth for the RPC URL/chain id, shared with the Magic
// auth SDK instance (hooks/MagicProvider.tsx) via lib/network.ts, so wagmi
// can't end up pointed at a different network than the one used for login.
const nativeToken = getNetworkToken();
const explorerUrl = process.env.NEXT_PUBLIC_EXPLORER_URL;

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

  useEffect(() => {
    const wagmiConfig = createConfig({
      multiInjectedProviderDiscovery: false,
      storage: null,
      batch: { multicall: false },
      chains: [sonicTestnet],
      connectors: [
        dedicatedWalletConnector({
          chains: [sonicTestnet],
          options: {
            apiKey: process.env.NEXT_PUBLIC_MAGIC_API_KEY as string,
            magicSdkConfiguration: {
              network: {
                rpcUrl: getNetworkUrl(),
                chainId: getChainId(),
              },
            },
          },
        }),
      ],
      transports: {
        [sonicTestnet.id]: http(),
      },
    });

    setConfig(wagmiConfig);
  }, []);

  return config;
}
