"use client";

import MagicProvider from "@/hooks/MagicProvider";
import React, { createContext, useContext, useState } from "react";

type MagicContextType = {
  token: string;
  setToken: React.Dispatch<React.SetStateAction<string>>;
};

const MagicContext = createContext<MagicContextType>({
  token: '',
  setToken: () => {},
});

export const Magic = ({ children }: { children: React.ReactNode }) => {

  const [token, setToken] = useState<string>('');

  return (
    <MagicContext.Provider value={{ token, setToken }}>
      <MagicProvider>
      {children}
      </MagicProvider>
    </MagicContext.Provider>
  );
};

export const useMagicState = () => useContext(MagicContext);