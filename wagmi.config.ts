import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
// FellowshipTokenSale isn't tracked in the backend Settings DB yet, and the
// DB's "post" ABI is currently stale (missing lastPostTime, which
// app/create/page.tsx depends on) — both stay on static ABI files until the
// DB is caught up.
import postContractData from "./lib/abis/CurateAIPost.json";
import tokenSaleContractData from "./lib/abis/FellowshipTokenSale.json";
import { Abi } from "viem";

// @wagmi/cli runs standalone (not through Next's env loading), so pull in
// .env ourselves to get NEXT_PUBLIC_API_URL.
try {
  process.loadEnvFile(".env");
} catch {
  // .env is optional here (e.g. CI providing the var directly)
}

interface ContractAbis {
  role: Abi;
  token: Abi;
  vote: Abi;
  settle: Abi;
}

// Mirrors the frontend's runtime contract-address fetch (hooks/api/settings.ts
// -> GET /settings/contracts) so ABIs and addresses come from the same
// backend Settings source instead of hand-copied JSON files drifting out of
// sync with what's actually deployed.
async function getContractAbisFromDb(): Promise<ContractAbis> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    throw new Error(
      "NEXT_PUBLIC_API_URL is not set - required to fetch contract ABIs from the backend for wagmi codegen"
    );
  }

  const res = await fetch(`${apiUrl}/settings/abis`);
  if (!res.ok) {
    throw new Error(
      `Failed to fetch contract ABIs from ${apiUrl}/settings/abis: ${res.status} ${res.statusText}`
    );
  }

  return res.json();
}

export default defineConfig(async () => {
  const abis = await getContractAbisFromDb();

  return {
    out: "hooks/wagmi/contracts.ts",
    contracts: [
      {
        name: "Curate AI Role Manager",
        abi: abis.role,
      },
      {
        name: "Curat AI Token",
        abi: abis.token,
      },
      {
        name: "Curate AI Posts",
        abi: postContractData.abi as Abi,
      },
      {
        name: "Curate AI Vote",
        abi: abis.vote,
      },
      {
        name: "Curate AI Settlement",
        abi: abis.settle,
      },
      {
        name: "Token Sale",
        abi: tokenSaleContractData.abi as Abi,
      },
    ],
    plugins: [react()],
  };
});
