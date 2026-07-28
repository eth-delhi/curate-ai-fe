"use client";

import { createContext, useContext } from "react";
import {
  ContractAddresses,
  useContractAddressesQuery,
} from "@/hooks/api/settings";

interface ContractAddressesContextValue {
  contracts: ContractAddresses | undefined;
  isLoading: boolean;
}

const ContractAddressesContext = createContext<ContractAddressesContextValue>(
  { contracts: undefined, isLoading: true }
);

// Fetches the on-chain contract addresses once (backend: GET /settings/contracts,
// backed by the Settings DB table) and makes them available synchronously to
// every consumer via useContractAddresses(). Replaces the old hardcoded
// constants/contract.ts.
export const ContractAddressesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data, isLoading } = useContractAddressesQuery();

  return (
    <ContractAddressesContext.Provider
      value={{ contracts: data, isLoading }}
    >
      {children}
    </ContractAddressesContext.Provider>
  );
};

export const useContractAddresses = () => useContext(ContractAddressesContext);
