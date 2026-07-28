"use client";

import { useEffect, useRef } from "react";
import { useAccount, useConnect } from "wagmi";
import { useAuth } from "@/hooks/useAuth";

/**
 * Nothing in the app ever calls wagmi's connect() explicitly — login only
 * authenticates against our own backend (JWT) via the Magic auth SDK
 * instance in hooks/MagicProvider.tsx, which is separate from the wagmi
 * `dedicatedWalletConnector` registered in context/wagmi.config.ts. Without
 * this, useAccount().address never populates, so every wagmi-dependent
 * feature (balances, voting, publishing) silently has no address to work
 * with. This connects the wagmi connector once we're authenticated; the
 * connector's own isAuthorized() check means it resolves immediately from
 * the existing Magic session rather than prompting a new login.
 *
 * `attempted` is intentionally never reset on failure. `isConnecting` flips
 * false -> true -> false around every attempt, which re-runs this effect —
 * resetting the guard in onError previously meant a single failed connect
 * (e.g. an unreachable/stale RPC URL) retried instantly and indefinitely,
 * hammering the RPC endpoint in a tight loop. One attempt per mount; a
 * failed connect stays failed until something explicit (re-auth, reload)
 * tries again.
 */
export function WalletAutoConnect() {
  const { isAuthenticated } = useAuth();
  const { isConnected, isConnecting } = useAccount();
  const { connect, connectors } = useConnect();
  const attempted = useRef(false);

  useEffect(() => {
    if (!isAuthenticated || isConnected || isConnecting) return;
    if (attempted.current) return;
    const connector = connectors[0];
    if (!connector) return;

    attempted.current = true;
    connect(
      { connector },
      {
        onError: (error) => {
          console.error("Wallet auto-connect failed:", error);
        },
      }
    );
  }, [isAuthenticated, isConnected, isConnecting, connect, connectors]);

  return null;
}
