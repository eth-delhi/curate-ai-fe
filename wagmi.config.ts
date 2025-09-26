import { defineConfig } from "@wagmi/cli";
import { react } from "@wagmi/cli/plugins";
import roleManagerContractData from "./lib/abis/CurateAIRoleManager.json";
import tokenContractData from "./lib/abis/CurateAIToken.json";
import postContractData from "./lib/abis/CurateAIPost.json";
import voteContractData from "./lib/abis/CurateAIVote.json";
import settlementContractData from "./lib/abis/CurateAISettlement.json";
import tokenSaleContractData from "./lib/abis/FellowshipTokenSale.json";
import { Abi } from "viem";

export default defineConfig({
  out: "hooks/wagmi/contracts.ts",
  contracts: [
    {
      name: "Curate AI Role Manager",
      abi: roleManagerContractData.abi as Abi,
    },
    {
      name: "Curat AI Token",
      abi: tokenContractData.abi as Abi,
    },
    {
      name: "Curate AI Posts",
      abi: postContractData.abi as Abi,
    },
    {
      name: "Curate AI Vote",
      abi: voteContractData.abi as Abi,
    },
    {
      name: "Curate AI Settlement",
      abi: settlementContractData.abi as Abi,
    },
    {
      name: "Token Sale",
      abi: tokenSaleContractData.abi as Abi,
    },
  ],
  plugins: [react()],
});
