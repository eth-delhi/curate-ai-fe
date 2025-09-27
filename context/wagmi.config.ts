"use client";

import { useState, useEffect } from "react";
import { http, createConfig, useDisconnect } from "wagmi";
import { dedicatedWalletConnector } from "@magiclabs/wagmi-connector";

export const sonicTestnet = {
  id: 57054,
  name: "Sonic Testnet",
  nativeCurrency: { decimals: 18, name: "Sonic", symbol: "S" },
  rpcUrls: { default: { http: [process.env.NEXT_PUBLIC_RPC_URL as string] } },
  blockExplorers: {
    default: {
      name: "Sonic Testnet Explorer",
      url: process.env.NEXT_PUBLIC_EXPLORER_URL as string,
    },
  },
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
                rpcUrl: process.env.NEXT_PUBLIC_RPC_URL as string,
                chainId: 57054,
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
