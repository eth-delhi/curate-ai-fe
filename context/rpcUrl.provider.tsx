"use client";

import { createContext, useContext } from "react";
import { useRpcUrlQuery } from "@/hooks/api/settings";

interface RpcUrlContextValue {
  rpcUrl: string | undefined;
  isLoading: boolean;
}

const RpcUrlContext = createContext<RpcUrlContextValue>({
  rpcUrl: undefined,
  isLoading: true,
});

// Fetches the active RPC URL once (backend: GET /settings/rpc-url, backed by
// the Settings DB table) and makes it available to Magic/wagmi client
// bootstrapping before they build their clients. Must be mounted above
// <Magic>/<Wagmi> in the provider tree — both need this value to construct
// their network config, not just to read contract data.
export const RpcUrlProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isLoading } = useRpcUrlQuery();

  return (
    <RpcUrlContext.Provider value={{ rpcUrl: data, isLoading }}>
      {children}
    </RpcUrlContext.Provider>
  );
};

export const useRpcUrl = () => useContext(RpcUrlContext);
