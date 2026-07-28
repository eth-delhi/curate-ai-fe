import { getChainId, getNetworkUrl } from "@/lib/network";
import { useRpcUrl } from "@/context/rpcUrl.provider";
import { OAuthExtension } from "@magic-ext/oauth";
import { Magic as MagicBase } from "magic-sdk";
import {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export type Magic = MagicBase<OAuthExtension[]>;

type MagicContextType = {
  magic: Magic | null;
};

const MagicContext = createContext<MagicContextType>({
  magic: null,
});

export const useMagic = () => useContext(MagicContext);

const MagicProvider = ({ children }: { children: ReactNode }) => {
  const [magic, setMagic] = useState<Magic | null>(null);
  const { rpcUrl } = useRpcUrl();

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_MAGIC_API_KEY && rpcUrl) {
      const magic = new MagicBase(
        process.env.NEXT_PUBLIC_MAGIC_API_KEY as string,
        {
          network: {
            rpcUrl: getNetworkUrl(rpcUrl),
            chainId: getChainId(),
          },
          extensions: [new OAuthExtension()],
        }
      );

      setMagic(magic);
    }
  }, [rpcUrl]);

  const value = useMemo(() => {
    return {
      magic,
    };
  }, [magic]);

  return (
    <MagicContext.Provider value={value}>{children}</MagicContext.Provider>
  );
};

export default MagicProvider;
