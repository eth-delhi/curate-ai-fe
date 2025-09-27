import { PINATA } from "@/constants/pinata";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { Synapse, RPC_URLS } from "@filoz/synapse-sdk";

import { getSynapseClient } from "@/lib/synapse";
import { ethers } from "ethers";

// Initialize SDK - Singleton pattern to ensure same instance
let synapse: Synapse | null = null;

const initializeSynapse = async () => {
  if (!synapse) {
    console.log("🔗 Creating new Synapse instance...");
    synapse = await Synapse.create({
      privateKey:
        "0x416e77da32eeb38714f0e9a9caf0bd14ea29225d07d964aa2aee074575e817eb",
      rpcURL: RPC_URLS.calibration.websocket, // Use calibration testnet for testing
    });
    console.log("✅ Synapse instance created:", synapse);
  } else {
    console.log("♻️ Reusing existing Synapse instance:", synapse);
  }
  return synapse;
};

// Payment setup (should be done once, not every upload)
export const setupSynapsePayments = async () => {
  console.log("💰 Setting up payments with Synapse instance...");
  const synapseInstance = await initializeSynapse();

  // 1. Deposit USDFC tokens (one-time setup)
  const amount = ethers.parseUnits("100", 18); // 100 USDFC
  console.log("💳 Depositing USDFC tokens...");
  await synapseInstance.payments.deposit(amount);

  // 2. Approve the Warm Storage service contract for automated payments
  const warmStorageAddress = await synapseInstance.getWarmStorageAddress();
  console.log("✅ Approving Warm Storage service...");
  await synapseInstance.payments.approveService(
    warmStorageAddress,
    ethers.parseUnits("10", 18),
    ethers.parseUnits("1000", 18),
    BigInt(86400)
  );

  console.log("🎉 Payment setup completed!");
  return synapseInstance;
};

// Simple upload function (after payment setup is complete)
export const useSynapseClient = async (data: Content) => {
  console.log("📤 Starting upload with Synapse instance...");
  // Use the SAME synapse instance that was set up with payments
  const synapseInstance = await initializeSynapse();

  // Just upload the data - payments should already be set up
  console.log("⬆️ Uploading data to Filecoin...");
  const result = await synapseInstance.storage.upload(
    new TextEncoder().encode(JSON.stringify(data))
  );

  console.log("🎉 Upload completed! Result:", result);

  // Extract the pieceCid string for storage
  const pieceCidString = result.pieceCid.toString();
  console.log("📝 PieceCID for storage:", pieceCidString);

  return {
    ...result,
    pieceCidString, // Add the string version for easy storage
  };
};

// Download function to retrieve data using pieceCid
export const downloadFromSynapse = async (pieceCidString: string) => {
  console.log("📥 Starting download with Synapse instance...");
  const synapseInstance = await initializeSynapse();

  console.log("⬇️ Downloading data from Filecoin...");
  console.log("🔍 PieceCID:", pieceCidString);

  try {
    // Convert string back to PieceCID object for download
    const data = await synapseInstance.storage.download(pieceCidString);
    const decodedData = new TextDecoder().decode(data);

    console.log("✅ Download successful!");
    console.log("📄 Retrieved data:", decodedData);

    return {
      data: decodedData,
      rawData: data,
    };
  } catch (error) {
    console.error("❌ Download failed:", error);
    throw error;
  }
};

// Cleanup function to properly close WebSocket connections
export const cleanupSynapseConnection = async () => {
  if (synapse) {
    console.log("🧹 Cleaning up Synapse connection...");
    try {
      const provider = synapse.getProvider();
      if (provider && typeof provider.destroy === "function") {
        await provider.destroy();
        console.log("✅ Synapse connection closed successfully");
      } else {
        console.log("ℹ️ Provider doesn't support destroy method");
      }
    } catch (error) {
      console.error("❌ Error closing Synapse connection:", error);
    } finally {
      // Clear the singleton instance
      synapse = null;
      console.log("🔄 Synapse instance cleared");
    }
  } else {
    console.log("ℹ️ No Synapse instance to cleanup");
  }
};

type Content = {
  title: string;
  content: string;
  date?: string;
  userWalletAddress?: string;
  tags: string[];
  coverImage?: string;
};

export const uploadToFilecoin = async (data: Content) => {
  data.date = new Date().toISOString();
  const synapse = await getSynapseClient();

  const jsonBytes = new TextEncoder().encode(JSON.stringify(data));
  const result = await synapse.storage.upload(jsonBytes);

  return result;
};

export const uploadFileToFilecoin = async (file: File) => {
  const synapse = await getSynapseClient();

  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);

  const result = await synapse.storage.upload(bytes);

  return result;
  // contains .pieceCid which replaces your IpfsHash
};

export const uploadToIpfs = async (data: Content) => {
  data.date = new Date().toISOString();
  const res = await axios.post(PINATA.PINANATE_URL, data, {
    headers: {
      pinata_api_key: PINATA.PINATA_API_KEY,
      pinata_secret_api_key: PINATA.PINATA_SECRET_KEY,
    },
  });

  return res.data;
};

export const uploadFileToPublicIpfs = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await axios.post("https://ipfs.io/api/v0/add", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  const hash = response.data.Hash;

  return hash;
};

export const uploadFileToIpfs = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await axios.post(PINATA.PINANATE_URL, formData, {
    headers: {
      pinata_api_key: PINATA.PINATA_API_KEY,
      pinata_secret_api_key: PINATA.PINATA_SECRET_KEY,
    },
  });

  return res.data;
};

export const useIpfsFileUpload = () => {
  return useMutation({
    mutationFn: uploadFileToIpfs,
  });
};

export const usePublicIpfsFileUpload = () => {
  return useMutation({
    mutationFn: uploadFileToPublicIpfs,
  });
};

export const useIPFSUpload = () => {
  // const { mutate } = useCreatePost();

  return useMutation({
    mutationFn: uploadToIpfs,
    // onSuccess(data, variables, context) {
    //   mutate({
    //     title: variables.title,
    //     content: variables.content,
    //     ipfsHash: data.IpfsHash,
    //     userWalletAddress: variables.userWalletAddress,
    //     published: false,
    //   });
    // },
  });
};
