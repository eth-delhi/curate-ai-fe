export enum Network {
  POLYGON_AMOY = "polygon-amoy",
  POLYGON = "polygon",
  ETHEREUM_SEPOLIA = "ethereum-sepolia",
  ETHEREUM = "ethereum",
  ETHERLINK = "etherlink",
  ETHERLINK_TESTNET = "etherlink-testnet",
  ZKSYNC = "zksync",
  ZKSYNC_SEPOLIA = "zksync-sepolia",
  SONIC_TESTNET = "sonic-blaze",
  HEDERA_TESTNET = "hedera-testnet",
  HARDHAT_LOCAL = "hardhat-local",
}

export const getNetworkUrl = (dbRpcUrl?: string) => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return "https://polygon-rpc.com/";
    case Network.POLYGON_AMOY:
      return "https://rpc-amoy.polygon.technology/";
    case Network.ETHEREUM_SEPOLIA:
      return "https://eth-sepolia.g.alchemy.com/v2/fYFybLQFR9Zr2GCRcgALmAktStFKr0i0";
    case Network.ETHEREUM:
      return "https://eth-mainnet.g.alchemy.com/v2/fYFybLQFR9Zr2GCRcgALmAktStFKr0i0";
    case Network.ETHERLINK:
      return "https://node.mainnet.etherlink.com";
    case Network.ETHERLINK_TESTNET:
      return "https://node.ghostnet.etherlink.com";
    case Network.ZKSYNC:
      return "https://mainnet.era.zksync.io";
    case Network.ZKSYNC_SEPOLIA:
      return "https://zksync-era-sepolia.blockpi.network/v1/rpc/public";
    case Network.SONIC_TESTNET:
      // Matches curate-ai-backend's RPC_URL — the endpoint that actually
      // signs mint/distribute transactions for the CAT token, so reads and
      // writes hit the same network.
      return "https://rpc.testnet.soniclabs.com";
    case Network.HEDERA_TESTNET:
      return "https://testnet.hashio.io/api";
    case Network.HARDHAT_LOCAL:
      // The tunnel URL (e.g. ngrok) rotates, so it's DB-backed
      // (GET /settings/rpc-url, see context/rpcUrl.provider.tsx) rather than
      // a build-time env var. NEXT_PUBLIC_RPC_URL is kept only as an
      // offline/rollback fallback if the DB value hasn't loaded yet.
      return (
        dbRpcUrl || process.env.NEXT_PUBLIC_RPC_URL || "http://127.0.0.1:8545"
      );
    default:
      throw new Error("Network not supported");
  }
};

export const getChainId = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return 137;
    case Network.POLYGON_AMOY:
      return 80002;
    case Network.ETHEREUM_SEPOLIA:
      return 11155111;
    case Network.ZKSYNC:
      return 324;
    case Network.ZKSYNC_SEPOLIA:
      return 300;
    case Network.ETHEREUM:
      return 1;
    case Network.ETHERLINK:
      return 42793;
    case Network.ETHERLINK_TESTNET:
      return 128123;
    case Network.SONIC_TESTNET:
      return 57054; // Sonic Testnet Chain ID
    case Network.HEDERA_TESTNET:
      return 296;
    case Network.HARDHAT_LOCAL:
      return 31337;
    default:
      throw new Error("Network not supported");
  }
};

export const getNetworkToken = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON_AMOY:
    case Network.POLYGON:
      return "MATIC";
    case Network.ETHEREUM:
    case Network.ETHEREUM_SEPOLIA:
    case Network.ZKSYNC:
    case Network.ZKSYNC_SEPOLIA:
      return "ETH";
    case Network.ETHERLINK:
    case Network.ETHERLINK_TESTNET:
      return "XTZ";
    case Network.SONIC_TESTNET:
      return "S";
    case Network.HEDERA_TESTNET:
      return "HBAR";
    case Network.HARDHAT_LOCAL:
      return "ETH";
    default:
      throw new Error("Network not supported");
  }
};

export const getFaucetUrl = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON_AMOY:
      return "https://faucet.polygon.technology/";
    case Network.ETHEREUM_SEPOLIA:
      return "https://sepoliafaucet.com/";
    case Network.ETHERLINK_TESTNET:
      return "https://faucet.etherlink.com/";
    case Network.ZKSYNC_SEPOLIA:
      return "https://faucet.quicknode.com/ethereum/sepolia";
    case Network.SONIC_TESTNET:
      return "https://faucet.testnet.soniclabs.com";
    default:
      return undefined;
  }
};

export const getNetworkName = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return "Polygon (Mainnet)";
    case Network.POLYGON_AMOY:
      return "Polygon (Amoy)";
    case Network.ETHEREUM_SEPOLIA:
      return "Ethereum (Sepolia)";
    case Network.ETHEREUM:
      return "Ethereum (Mainnet)";
    case Network.ETHERLINK:
      return "Etherlink (Mainnet)";
    case Network.ETHERLINK_TESTNET:
      return "Etherlink (Testnet)";
    case Network.ZKSYNC:
      return "zkSync (Mainnet)";
    case Network.ZKSYNC_SEPOLIA:
      return "zkSync (Sepolia)";
    case Network.SONIC_TESTNET:
      return "Sonic (Blaze Testnet)";
    case Network.HEDERA_TESTNET:
      return "Hedera (Testnet)";
    case Network.HARDHAT_LOCAL:
      return "Hardhat (Local)";
    default:
      throw new Error("Network not supported");
  }
};

export const getBlockExplorer = (address: string) => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.POLYGON:
      return `https://polygonscan.com/address/${address}`;
    case Network.POLYGON_AMOY:
      return `https://www.oklink.com/amoy/address/${address}`;
    case Network.ETHEREUM:
      return `https://etherscan.io/address/${address}`;
    case Network.ETHEREUM_SEPOLIA:
      return `https://sepolia.etherscan.io/address/${address}`;
    case Network.ETHERLINK:
      return `https://explorer.etherlink.com/address/${address}`;
    case Network.ETHERLINK_TESTNET:
      return `https://testnet-explorer.etherlink.com/address/${address}`;
    case Network.ZKSYNC:
      return `https://explorer.zksync.io/address/${address}`;
    case Network.ZKSYNC_SEPOLIA:
      return `https://sepolia.explorer.zksync.io/address/${address}`;
    case Network.SONIC_TESTNET:
      return `https://explorer.testnet.soniclabs.com/address/${address}`;
    case Network.HARDHAT_LOCAL:
      // No block explorer for a local node.
      return "";
    default:
      throw new Error("Network not supported");
  }
};

export const isEip1559Supported = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.ETHEREUM_SEPOLIA:
    case Network.ETHEREUM:
    case Network.HARDHAT_LOCAL:
      return true;
    case Network.ZKSYNC:
    case Network.ZKSYNC_SEPOLIA:
    case Network.POLYGON:
    case Network.POLYGON_AMOY:
    case Network.ETHERLINK:
    case Network.ETHERLINK_TESTNET:
    case Network.SONIC_TESTNET:
      return false;
    default:
      throw new Error("Network not supported");
  }
};
