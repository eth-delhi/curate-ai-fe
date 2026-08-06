// Admin-side chain prep for a freshly-created Magic wallet, done directly
// against the local hardhat node (127.0.0.1:8545). Two things the create-post
// UI gates on that a brand-new wallet lacks:
//   1. native gas   -> hardhat_setBalance
//   2. CURATOR_ROLE -> RoleManager.grantRole, sent by the role admin
//
// Role granting uses hardhat account impersonation, so we never need a private
// key: we ask the node to send the tx *as* whichever account holds the admin
// role. This only works on a hardhat/anvil node.

import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { ethers } from "ethers";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TEN_ETH_HEX = "0x8AC7230489E80000"; // 10 ETH

const roleAbi = JSON.parse(
  await readFile(join(__dirname, "../../lib/abis/CurateAIRoleManager.json"), "utf8")
);

export function makeProvider(rpcUrl) {
  return new ethers.JsonRpcProvider(rpcUrl);
}

/** Sets the wallet's native balance to 10 ETH so it can cover gas. */
export async function fundWallet(provider, address) {
  await provider.send("hardhat_setBalance", [address, TEN_ETH_HEX]);
}

/**
 * Ensures `wallet` holds CURATOR_ROLE on the RoleManager. Finds the account
 * that admins the role, impersonates it, and grants. Idempotent.
 * Returns { alreadyHad, grantedBy, txHash }.
 */
export async function ensureCuratorRole(provider, roleAddress, wallet) {
  const role = new ethers.Contract(roleAddress, roleAbi, provider);
  const CURATOR_ROLE = await role.CURATOR_ROLE();

  if (await role.hasRole(CURATOR_ROLE, wallet)) {
    return { alreadyHad: true, grantedBy: null, txHash: null };
  }

  const adminRole = await role.getRoleAdmin(CURATOR_ROLE);

  // Find an unlocked account that can grant (holds the admin role).
  const accounts = await provider.send("eth_accounts", []);
  let admin = null;
  for (const acct of accounts) {
    if (await role.hasRole(adminRole, acct)) {
      admin = acct;
      break;
    }
  }
  if (!admin) {
    throw new Error(
      `no unlocked account holds the admin role (${adminRole}) for CURATOR_ROLE; ` +
        `cannot grant on-chain post permission`
    );
  }

  const iface = new ethers.Interface(roleAbi);
  const data = iface.encodeFunctionData("grantRole", [CURATOR_ROLE, wallet]);

  await provider.send("hardhat_impersonateAccount", [admin]);
  try {
    await provider.send("hardhat_setBalance", [admin, TEN_ETH_HEX]);
    const txHash = await provider.send("eth_sendTransaction", [
      { from: admin, to: roleAddress, data },
    ]);
    await provider.waitForTransaction(txHash);
    return { alreadyHad: false, grantedBy: admin, txHash };
  } finally {
    await provider.send("hardhat_stopImpersonatingAccount", [admin]);
  }
}

/** Quick sanity read used by preflight. */
export async function chainId(provider) {
  const net = await provider.getNetwork();
  return Number(net.chainId);
}
