import { PINATA } from "@/constants/pinata";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";

type Content = {
  title: string;
  content: string;
  date?: string;
  userWalletAddress?: string;
  tags: string[];
  coverImage?: string;
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
