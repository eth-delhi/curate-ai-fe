"use client";

import { WagmiProvider } from "wagmi";
import { useWagmiConfig } from "./wagmi.config";

export const Wagmi = ({ children }: { children: React.ReactNode }) => {
  const config = useWagmiConfig();

  if (!config) return null;

  return <WagmiProvider config={config}>{children}</WagmiProvider>;
};
