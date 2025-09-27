import { showToast } from "@/utils/showToast";
import { useMutation } from "@tanstack/react-query";
import API from "../utils/axiosInstance";

const login = async (user: {
  email: string;
  walletAddress: string;
  token: string;
}) => {
  if (!user.email || !user.walletAddress || !user.token) {
    throw new Error("Invalid user data");
  }

  const res = await API.post("/auth/login", user);

  return res.data;
};

export const useLogin = () => {
  return useMutation({
    mutationFn: login,
    onSuccess: (data) => {
      localStorage.setItem("accessToken", `${data.accessToken}`);
    },
    onError: (error) => {
      console.log("error", error);
      showToast({
        message: "Failed to login",
        type: "error",
      });
    },
  });
};
