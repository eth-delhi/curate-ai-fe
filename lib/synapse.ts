import { Synapse } from "@filoz/synapse-sdk";
import { ethers } from "ethers";

export async function getSynapseClient() {
  // frontend: get provider from MetaMask
  const provider = new ethers.BrowserProvider(window.ethereum);
  await provider.send("eth_requestAccounts", []);
  const synapse = await Synapse.create({ provider });
  return synapse;
}
