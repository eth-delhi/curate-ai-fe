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
}

export const getNetworkUrl = () => {
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
      return "https://sonic-blaze.g.alchemy.com/v2/qAEksW6pFqzHzh8WDvAC5CnhfBII8fJ-";
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
    default:
      throw new Error("Network not supported");
  }
};

export const isEip1559Supported = () => {
  switch (process.env.NEXT_PUBLIC_BLOCKCHAIN_NETWORK) {
    case Network.ETHEREUM_SEPOLIA:
    case Network.ETHEREUM:
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
