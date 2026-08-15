"use client";

import { useState, useEffect, use, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { SuccessButton, useActionStatus } from "@/components/ui/SuccessButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HomeNavbar from "@/components/ui/HomeNavbar";
import { AmbientDots, display } from "@/components/brutal";
import { usePosts } from "@/hooks/api/posts";
import {
  useUpdateProfile,
  useUserProfile,
  useUploadAvatar,
} from "@/hooks/api/profile";
import { useGetDrafts } from "@/hooks/api/drafts";
import { useScoredPosts } from "@/hooks/api/scores";
import {
  useFollowUser,
  useUnfollowUser,
  useFollowStatus,
  useUserFollowers,
  useUserFollowing,
} from "@/hooks/api/follows";
import { mapApiPostsToBlogPosts } from "@/utils/mappers";
import { convertBlogPostToDisplayPost } from "@/utils/home-revamp";
import { FeedPostCard } from "@/components/home-revamp/FeedSection";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { showToast } from "@/utils/showToast";
import { useAccount, useBalance, useSendTransaction } from "wagmi";
import { ProfileLeftSidebar } from "@/components/profile/ProfileLeftSidebar";
import ReferralTab from "@/components/profile/ReferralTab";
import { parseUnits, formatUnits, isAddress } from "viem";
import { useWriteCuratAiTokenTransfer } from "@/hooks/wagmi/contracts";
import { useContractAddresses } from "@/context/contractAddresses.provider";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { useWalletByUsername, useUsernameByWallet } from "@/hooks/api/users";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Upload, X } from "lucide-react";
import {
  TOKEN_DISPLAY_NAMES,
  NATIVE_TOKEN_SYMBOL,
  RPC_POLL_INTERVAL_MS,
} from "@/constants/chain";
import {
  Edit2,
  Calendar,
  MapPin,
  LinkIcon,
  Settings as SettingsIcon,
  FileText,
  BarChart2,
  Copy,
  Check,
  Loader2,
  AlertCircle,
  AlertTriangle,
  Send,
  ChevronDown,
} from "lucide-react";
import {
  FollowIcon,
  UnfollowIcon,
  WalletIcon,
} from "@/components/icons";

// Wallet Tab Component
function WalletTab() {
  const { address: userAddress } = useAccount();
  const { contracts } = useContractAddresses();
  const [activeTokenTab, setActiveTokenTab] = useState<"CAT" | "SONIC">("CAT");
  const [sendMode, setSendMode] = useState<"address" | "username">("address");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientUsername, setRecipientUsername] = useState("");
  const [debouncedAddress, setDebouncedAddress] = useState("");
  const [debouncedUsername, setDebouncedUsername] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Debounce recipient inputs before firing lookup queries
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedAddress(recipientAddress);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [recipientAddress]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedUsername(recipientUsername);
    }, 400);
    return () => clearTimeout(timeoutId);
  }, [recipientUsername]);

  // Address mode: check whether this address belongs to a CurateAI user
  const {
    data: usernameLookup,
    isLoading: isUsernameLookupLoading,
  } = useUsernameByWallet(debouncedAddress, {
    enabled: sendMode === "address" && isAddress(debouncedAddress),
  });

  // Username mode: resolve the wallet address for the given username
  const {
    data: walletLookup,
    isLoading: isWalletLookupLoading,
  } = useWalletByUsername(debouncedUsername, {
    enabled: sendMode === "username" && debouncedUsername.trim().length > 0,
  });

  // The address that will actually receive the transfer
  const resolvedRecipient =
    sendMode === "address" ? recipientAddress : walletLookup?.walletAddress;

  // Fetch CAT token balance
  const { balance: catBalance, refetch: refetchCatBalance } =
    useCatTokenBalance();

  // Fetch SONIC (native) balance
  const { data: sonicBalance, refetch: refetchSonicBalance } = useBalance({
    address: userAddress,
    query: {
      refetchInterval: RPC_POLL_INTERVAL_MS,
      staleTime: RPC_POLL_INTERVAL_MS,
    },
  });

  // Token transfer hook for CAT
  const {
    writeContractAsync: transferCatToken,
    isPending: isCatTransferPending,
  } = useWriteCuratAiTokenTransfer();

  // Native token transfer hook for SONIC
  const {
    sendTransaction: sendSonicTransaction,
    isPending: isSonicTransferPending,
  } = useSendTransaction();
  // Driven manually (not via useActionStatus) since handleTransfer has
  // several validation branches that return early before the actual
  // transfer — wrapping the whole handler in run() would risk flashing a
  // false success tick on a validation failure.
  const [transferSuccessTick, setTransferSuccessTick] = useState(false);
  const showTransferSuccessTick = () => {
    setTransferSuccessTick(true);
    setTimeout(() => setTransferSuccessTick(false), 1400);
  };

  // Format token balances
  // Match post page behavior: show raw balance value
  const formatCatBalance = () => {
    if (!catBalance) return "0";
    // Show raw balance like the post page does
    return catBalance.toString();
  };

  const formatGasTokenBalance = () => {
    if (!sonicBalance?.value) return "0.00";
    // Native tokens always use 18 decimals
    const formatted = formatUnits(sonicBalance.value, 18);
    return parseFloat(formatted).toFixed(4);
  };

  // Handle token transfer
  const handleTransfer = async () => {
    if (!userAddress) {
      showToast({
        message: "Please connect your wallet",
        type: "error",
      });
      return;
    }

    if (sendMode === "address" && (!recipientAddress || !isAddress(recipientAddress))) {
      showToast({
        message: "Please enter a valid recipient address",
        type: "error",
      });
      return;
    }

    if (sendMode === "username" && !walletLookup?.walletAddress) {
      showToast({
        message: "Please enter a valid, existing username",
        type: "error",
      });
      return;
    }

    const recipient = resolvedRecipient as `0x${string}` | undefined;
    if (!recipient || !isAddress(recipient)) {
      showToast({
        message: "Unable to resolve a valid recipient address",
        type: "error",
      });
      return;
    }

    if (!transferAmount || parseFloat(transferAmount) <= 0) {
      showToast({
        message: "Please enter a valid amount",
        type: "error",
      });
      return;
    }

    setIsTransferring(true);

    try {
      if (activeTokenTab === "CAT") {
        // Transfer CAT token.
        // CAT is used in whole-token units throughout the app — balanceOf,
        // votes, and cooldown burns all read/pass unscaled amounts — even
        // though the token's decimals() reports 18. Scaling the amount by
        // decimals() here would over-inflate it by 1e18 and revert on-chain,
        // so send the entered amount as whole tokens (0 decimals).
        const amount = parseUnits(transferAmount, 0);

        if (!contracts) {
          showToast({
            message: "Contract addresses not loaded yet. Please wait...",
            type: "error",
          });
          setIsTransferring(false);
          return;
        }

        await transferCatToken({
          address: contracts.token as `0x${string}`,
          args: [recipient, amount],
        });

        showTransferSuccessTick();

        // Refetch balances
        refetchCatBalance();
      } else {
        // Transfer SONIC (native token)
        // Native tokens always use 18 decimals
        const amount = parseUnits(transferAmount, 18);

        await sendSonicTransaction({
          to: recipient,
          value: amount,
        });

        showTransferSuccessTick();

        // Refetch balances
        refetchSonicBalance();
      }

      // Reset form
      setRecipientAddress("");
      setRecipientUsername("");
      setTransferAmount("");
    } catch (error: any) {
      console.error("Transfer error:", error);
      showToast({
        message: error?.message || "Transfer failed. Please try again.",
        type: "error",
      });
    } finally {
      setIsTransferring(false);
    }
  };

  const isLoading = isCatTransferPending || isSonicTransferPending;

  // True only when a valid positive amount has been entered that exceeds the
  // active token's balance. Used to disable the transfer button (rather than
  // surfacing an "insufficient balance" toast on submit). Returns false for
  // empty/invalid amounts so the existing "enter a valid amount" validation
  // still handles those on click.
  const hasInsufficientBalance = (() => {
    const amountStr = transferAmount.trim();
    if (!amountStr || parseFloat(amountStr) <= 0) return false;
    try {
      if (activeTokenTab === "CAT") {
        if (catBalance === undefined) return false;
        // catBalance is in whole CAT tokens (see handleTransfer) — compare the
        // entered amount in the same unit, with no decimals() scaling.
        return parseFloat(amountStr) > Number(catBalance);
      }
      if (sonicBalance?.value === undefined) return false;
      return parseUnits(amountStr, 18) > sonicBalance.value;
    } catch {
      // parseUnits throws on malformed input (e.g. too many decimals); let
      // the on-click validation handle those rather than disabling here.
      return false;
    }
  })();

  return (
    <div className="space-y-6">
      {/* Transfer form — sits on the page, no card */}
      <div>
        <div className="mb-6 border-t border-[color:var(--border)] pt-8">
          <h2 className={`${display} text-2xl font-black uppercase tracking-tight text-[#0A0A0A]`}>
            Send Tokens
          </h2>
          <p className="mt-1.5 text-[13px] text-[#0A0A0A]/55">
            Transfer {TOKEN_DISPLAY_NAMES.CAT} or {TOKEN_DISPLAY_NAMES.SONIC} to
            another wallet address or CurateAI username.
          </p>
        </div>

        {/* Token type sub-tabs */}
        <div className="mb-6 flex gap-6 border-b border-[color:var(--border)]">
          <button
            onClick={() => setActiveTokenTab("CAT")}
            className={`relative py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
              activeTokenTab === "CAT"
                ? "text-[#0A0A0A]"
                : "text-[#0A0A0A]/45 hover:text-[#0A0A0A]"
            }`}
          >
            {TOKEN_DISPLAY_NAMES.CAT}
            {activeTokenTab === "CAT" && (
              <motion.span
                layoutId="wallet-token-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
          <button
            onClick={() => setActiveTokenTab("SONIC")}
            className={`relative py-2.5 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
              activeTokenTab === "SONIC"
                ? "text-[#0A0A0A]"
                : "text-[#0A0A0A]/45 hover:text-[#0A0A0A]"
            }`}
          >
            {TOKEN_DISPLAY_NAMES.SONIC}
            {activeTokenTab === "SONIC" && (
              <motion.span
                layoutId="wallet-token-tab"
                className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A]"
                transition={{ type: "spring", stiffness: 500, damping: 35 }}
              />
            )}
          </button>
        </div>

        {/* Transfer Form */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label
                htmlFor="recipient"
                className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]/55"
              >
                Send by
              </label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    type="button"
                    className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.12em] text-[#0A0A0A] transition-opacity duration-150 hover:opacity-70"
                  >
                    {sendMode === "address" ? "Wallet Address" : "Username"}
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => setSendMode("address")}>
                    Wallet Address
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSendMode("username")}>
                    Username
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {sendMode === "address" ? (
              <>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="0x..."
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  className="rounded-none border-0 border-b border-[#0A0A0A] bg-transparent px-0 font-mono text-[13px] shadow-none transition-all duration-150 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-[#0A0A0A]/40 focus-visible:border-b-2 focus-visible:ring-0"
                />
                {isAddress(debouncedAddress) && (
                  <div className="mt-2 text-sm">
                    {isUsernameLookupLoading ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Checking address...
                      </span>
                    ) : usernameLookup ? (
                      <span className="flex items-center gap-1 text-[#0A0A0A]">
                        <Check className="w-3.5 h-3.5" />
                        Sending to @{usernameLookup.username}
                      </span>
                    ) : (
                      <span className="flex items-start gap-1 text-[#0A0A0A]/55">
                        <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                        This wallet isn&apos;t part of the CurateAI ecosystem
                        yet, but you can still send — it&apos;s a standard
                        ERC20 transfer.
                      </span>
                    )}
                  </div>
                )}
              </>
            ) : (
              <>
                <Input
                  id="recipient"
                  type="text"
                  placeholder="username"
                  value={recipientUsername}
                  onChange={(e) => setRecipientUsername(e.target.value)}
                  className="rounded-none border-0 border-b border-[#0A0A0A] bg-transparent px-0 text-[14px] shadow-none transition-all duration-150 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-[#0A0A0A]/40 focus-visible:border-b-2 focus-visible:ring-0"
                />
                {debouncedUsername.trim().length > 0 && (
                  <div className="mt-2 text-sm">
                    {isWalletLookupLoading ? (
                      <span className="flex items-center gap-1 text-muted-foreground">
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Looking up user...
                      </span>
                    ) : walletLookup ? (
                      <span className="flex items-center gap-1 text-[#0A0A0A] font-mono">
                        <Check className="w-3.5 h-3.5 shrink-0" />
                        Sending to {walletLookup.walletAddress}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-destructive">
                        <AlertCircle className="w-3.5 h-3.5" />
                        No user found with that username.
                      </span>
                    )}
                  </div>
                )}
              </>
            )}
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]/55"
            >
              Amount (
              {activeTokenTab === "CAT"
                ? TOKEN_DISPLAY_NAMES.CAT
                : TOKEN_DISPLAY_NAMES.SONIC}
              )
            </label>
            <div className="relative mt-1">
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="rounded-none border-0 border-b border-[#0A0A0A] bg-transparent px-0 pr-16 text-[16px] shadow-none transition-all duration-150 placeholder:text-[#0A0A0A]/40 focus-visible:border-b-2 focus-visible:ring-0"
              />
              <div className="absolute right-0 top-1/2 -translate-y-1/2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A]/45">
                {activeTokenTab === "CAT"
                  ? TOKEN_DISPLAY_NAMES.CAT
                  : TOKEN_DISPLAY_NAMES.SONIC}
              </div>
            </div>
            <p className="mt-2 text-right text-[10px] uppercase tracking-[0.14em] text-[#0A0A0A]/45">
              Available:{" "}
              {activeTokenTab === "CAT"
                ? formatCatBalance()
                : formatGasTokenBalance()}{" "}
              {activeTokenTab === "CAT"
                ? TOKEN_DISPLAY_NAMES.CAT
                : TOKEN_DISPLAY_NAMES.SONIC}
            </p>
          </div>

          <SuccessButton
            onClick={handleTransfer}
            status={
              transferSuccessTick
                ? "success"
                : isLoading || isTransferring
                ? "loading"
                : "idle"
            }
            disabled={
              isLoading ||
              isTransferring ||
              !userAddress ||
              hasInsufficientBalance ||
              (sendMode === "address"
                ? !isAddress(recipientAddress)
                : !walletLookup?.walletAddress)
            }
            loadingChildren={
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transferring...
              </>
            }
            className="w-full rounded-none border border-[#0A0A0A] bg-[#0A0A0A] text-[12px] font-bold uppercase tracking-[0.16em] text-[#F5F4F0] transition-colors duration-150 hover:bg-[#F5F4F0] hover:text-[#0A0A0A]"
          >
            <Send className="w-4 h-4 mr-2" />
            Transfer{" "}
            {activeTokenTab === "CAT"
              ? TOKEN_DISPLAY_NAMES.CAT
              : TOKEN_DISPLAY_NAMES.SONIC}
          </SuccessButton>

          {!userAddress && (
            <p className="text-sm text-[#0A0A0A]/55 text-center">
              Please connect your wallet to transfer tokens
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

interface ProfileRevampPageProps {
  params: Promise<{
    id: string;
  }>;
}

// Helper function to get user UUID from JWT token
const getUserIdFromToken = (): string | null => {
  try {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;

    const payload = JSON.parse(atob(token.split(".")[1]));
    // Try different possible fields where user ID might be stored
    return payload.uuid || payload.userId || payload.sub || payload.id || null;
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export default function ProfileRevampPage({ params }: ProfileRevampPageProps) {
  const { id } = use(params);
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(
    () => searchParams.get("tab") || "posts"
  );
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isAddressCopied, setIsAddressCopied] = useState(false);

  // Get current user ID from token
  useEffect(() => {
    const userId = getUserIdFromToken();
    setCurrentUserId(userId);
  }, []);

  // Check if viewing own profile
  const isOwnProfile = currentUserId === id;

  // Avatar upload hook — backend stores in S3 and pins to IPFS, returns the CID
  const uploadAvatarMutation = useUploadAvatar();

  // Fetch user profile
  const {
    data: profileData,
    isLoading: isProfileLoading,
    error: profileError,
    isError: isProfileError,
  } = useUserProfile(id);

  // Set page title to username
  useEffect(() => {
    if (profileData?.profile?.username) {
      document.title = profileData.profile.username;
    } else if (profileData?.email) {
      document.title = profileData.email.split("@")[0];
    }
  }, [profileData?.profile?.username, profileData?.email]);

  // Profile update mutation
  const updateProfileMutation = useUpdateProfile();
  const { status: saveProfileStatus, run: runSaveProfile } = useActionStatus();

  // Follow/unfollow hooks (only fetch status if viewing someone else's profile)
  const followUserMutation = useFollowUser();
  const unfollowUserMutation = useUnfollowUser();
  const { data: followStatus, isLoading: isFollowStatusLoading } =
    useFollowStatus(id, { enabled: !isOwnProfile && !!id });

  // Get followers and following counts for the profile
  const { data: followersData, isLoading: isFollowersLoading } =
    useUserFollowers(id);
  const { data: followingData, isLoading: isFollowingLoading } =
    useUserFollowing(id);

  const followersCount = followersData?.length || 0;
  const followingCount = followingData?.length || 0;

  // Form state
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    bio: "",
    location: "",
    website: "",
  });

  // Original values from API (for comparison)
  const [originalValues, setOriginalValues] = useState({
    username: "",
    fullName: "",
    bio: "",
    location: "",
    website: "",
  });

  // Track if we've initialized originalValues to prevent re-initialization
  const hasInitialized = useRef(false);

  // Fetch posts created by this user
  const {
    data: postsData,
    isLoading: isPostsLoading,
    error: postsError,
    isError: isPostsError,
  } = usePosts({
    userUuid: id,
    page: 1,
    limit: 50,
    sortOrder: "desc",
    sortBy: "createdAt",
  });

  // Map API data to DisplayPost format
  const blogPosts = postsData ? mapApiPostsToBlogPosts(postsData.posts) : [];
  const userPosts = blogPosts.map((post, index) =>
    convertBlogPostToDisplayPost(post, index)
  );

  // Fetch posts scored by this user
  const {
    data: scoredPostsData,
    isLoading: isScoredPostsLoading,
    error: scoredPostsError,
    isError: isScoredPostsError,
  } = useScoredPosts(id, {
    page: 1,
    limit: 50,
  });

  // Map scored posts to DisplayPost format
  const scoredBlogPosts = scoredPostsData
    ? mapApiPostsToBlogPosts(scoredPostsData.posts)
    : [];
  const scoredPosts = scoredBlogPosts.map((post, index) =>
    convertBlogPostToDisplayPost(post, index)
  );

  // Map API profile data to userData format
  // Helper function to get IPFS URL from hash
  const getIpfsUrl = (hash?: string | null): string | null => {
    if (!hash) return null;
    return `https://gateway.pinata.cloud/ipfs/${hash}`;
  };

  const handleCopyWalletAddress = async (address: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setIsAddressCopied(true);
      setTimeout(() => setIsAddressCopied(false), 2000);
    } catch {
      showToast({ message: "Failed to copy address", type: "error" });
    }
  };

  const userData = profileData
    ? {
        name:
          profileData.profile?.fullName ||
          profileData.email?.split("@")[0] ||
          "User",
        username:
          profileData.profile?.username ||
          profileData.email?.split("@")[0] ||
          "user",
        avatar:
          getIpfsUrl(profileData.profile?.profilePic) ||
          "/placeholder.svg?height=200&width=200",
        bio: profileData.profile?.bio || "",
        location: profileData.profile?.location || "",
        website: profileData.profile?.website || "",
        joinDate: profileData.createdAt
          ? formatDistanceToNow(new Date(profileData.createdAt), {
              addSuffix: false,
            })
          : "",
        followers: followersCount,
        following: followingCount,
        posts:
          profileData.stats?.postsCount ||
          postsData?.pagination?.total ||
          userPosts.length,
        walletAddress: profileData.walletAddress || "",
      }
    : {
        name: "Loading...",
        username: "loading",
        avatar: "/placeholder.svg?height=200&width=200",
        bio: "",
        location: "",
        website: "",
        joinDate: "",
        followers: 0,
        following: 0,
        posts: 0,
        walletAddress: "",
      };

  // Initialize form data with profileData when it's loaded or refetched after update
  useEffect(() => {
    if (profileData?.profile) {
      const initialValues = {
        username: (profileData.profile.username || "").trim(),
        fullName: (profileData.profile.fullName || "").trim(),
        bio: (profileData.profile.bio || "").trim(),
        location: (profileData.profile.location || "").trim(),
        website: (profileData.profile.website || "").trim(),
      };

      if (!hasInitialized.current) {
        // First initialization
        console.log("Initializing form with values:", initialValues);
        setFormData(initialValues);
        setOriginalValues(initialValues);
        hasInitialized.current = true;
      } else {
        // Update after refetch (profile was updated)
        console.log("Updating form after profile refetch:", initialValues);
        setFormData(initialValues);
        setOriginalValues(initialValues);
      }
    }
  }, [profileData]);

  // Handle form input change
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle profile picture file selection and upload
  const handleProfilePicChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      showToast({
        message: "Please select an image file",
        type: "error",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast({
        message: "Image size should be less than 5MB",
        type: "error",
      });
      return;
    }

    // Create preview immediately
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePicPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload immediately
    setIsUploadingProfilePic(true);
    try {
      const uploadResult = await uploadAvatarMutation.mutateAsync(file);
      const ipfsHash = uploadResult.ipfsHash;

      if (!ipfsHash) {
        throw new Error("Failed to get IPFS hash from upload response");
      }

      // Update profile with IPFS hash
      await updateProfileMutation.mutateAsync({
        id: id,
        data: { profilePic: ipfsHash },
      });

      // The real avatar re-renders in place of the preview once the profile
      // query refetches, which is confirmation enough.

      // Clear preview after successful upload
      setProfilePicPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Profile picture upload error:", error);
      showToast({
        message:
          error?.message ||
          "Failed to upload profile picture. Please try again.",
        type: "error",
      });
      // Clear preview on error
      setProfilePicPreview(null);
    } finally {
      setIsUploadingProfilePic(false);
    }
  };

  // Helper function to compare values (handles empty strings and trimming)
  const hasChanged = (newValue: string, originalValue: string): boolean => {
    const trimmedNew = (newValue || "").trim();
    const trimmedOriginal = (originalValue || "").trim();
    return trimmedNew !== trimmedOriginal;
  };

  // Handle form submission - only send changed values
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure originalValues have been initialized from API
    if (!hasInitialized.current || originalValues.username === "") {
      showToast({
        message: "Profile data not loaded yet. Please wait...",
        type: "error",
      });
      return;
    }

    try {
      // Build update data with only changed fields
      const updateData: {
        username?: string;
        fullName?: string;
        bio?: string;
        location?: string;
        website?: string;
        profilePic?: string;
      } = {};

      // Only include fields that have changed (using trimmed comparison)
      // Check each field individually and log for debugging
      if (hasChanged(formData.username, originalValues.username)) {
        console.log(
          `Username changed: "${originalValues.username}" -> "${formData.username}"`
        );
        updateData.username = formData.username.trim();
      }
      if (hasChanged(formData.fullName, originalValues.fullName)) {
        console.log(
          `FullName changed: "${originalValues.fullName}" -> "${formData.fullName}"`
        );
        updateData.fullName = formData.fullName.trim();
      }
      if (hasChanged(formData.bio, originalValues.bio)) {
        console.log(
          `Bio changed: "${originalValues.bio}" -> "${formData.bio}"`
        );
        updateData.bio = formData.bio.trim();
      }
      if (hasChanged(formData.location, originalValues.location)) {
        console.log(
          `Location changed: "${originalValues.location}" -> "${formData.location}"`
        );
        updateData.location = formData.location.trim();
      }
      if (hasChanged(formData.website, originalValues.website)) {
        // Only send website if it's changed and not empty
        const trimmedWebsite = formData.website.trim();
        if (trimmedWebsite !== "") {
          console.log(
            `Website changed: "${originalValues.website}" -> "${formData.website}"`
          );
          updateData.website = trimmedWebsite;
        }
        // If changed to empty, don't include it in the update (field remains unchanged)
      }

      // Check if there are any changes
      if (Object.keys(updateData).length === 0) {
        showToast({
          message: "No changes to save",
          type: "info",
        });
        return;
      }

      console.log("Original values:", originalValues);
      console.log("Form data:", formData);
      console.log("Sending only changed fields:", updateData);

      // Profile will automatically refetch via query invalidation/refetch —
      // the useEffect will update formData/originalValues when new data
      // arrives. Confirmation is the button's own success tick, not a toast.
      await runSaveProfile(async () => {
        await updateProfileMutation.mutateAsync({
          id: id,
          data: updateData,
        });
      });
    } catch (error) {
      console.error("Profile update error:", error);
      showToast({
        message: "Failed to update profile. Please try again.",
        type: "error",
      });
    }
  };

  // Fetch drafts
  const {
    data: draftsData,
    isLoading: isDraftsLoading,
    error: draftsError,
  } = useGetDrafts();

  // Helper function to calculate completion percentage
  const calculateCompletionPercentage = (draft: {
    title?: string;
    content?: string;
  }): number => {
    let score = 0;
    if (draft.title && draft.title.trim().length > 0) score += 30;
    if (draft.content && draft.content.trim().length > 0) {
      const contentLength = draft.content.trim().length;
      // Content completion based on length (max 70 points)
      score += Math.min(70, Math.floor((contentLength / 500) * 70));
    }
    return Math.min(100, score);
  };

  // Handle follow/unfollow
  const handleFollow = async () => {
    try {
      // The button itself flips to "Following" once the query invalidates,
      // so no toast is needed on success.
      await followUserMutation.mutateAsync({
        followingUuid: id,
      });
    } catch (error: any) {
      console.error("Follow error:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to follow user",
        type: "error",
      });
    }
  };

  const handleUnfollow = async () => {
    try {
      await unfollowUserMutation.mutateAsync({
        followingUuid: id,
      });
    } catch (error: any) {
      console.error("Unfollow error:", error);
      showToast({
        message: error?.response?.data?.message || "Failed to unfollow user",
        type: "error",
      });
    }
  };

  const isFollowing = followStatus?.isFollowing || false;
  const isFollowPending =
    followUserMutation.isPending || unfollowUserMutation.isPending;

  return (
    <div className="profile-page relative min-h-screen bg-background text-foreground">
      <AmbientDots still={false} />
      <style jsx global>{`
        .profile-page {
          font-family: var(--font-sans), system-ui, sans-serif;
        }

        .prose {
          --tw-prose-headings: #1a1a1a;
          --tw-prose-body: #1a1a1a;
          --tw-prose-links: #1a1a1a;
          --tw-prose-bold: #1a1a1a;
          --tw-prose-counters: #6b6b6b;
          --tw-prose-bullets: #e6e5e0;
          --tw-prose-hr: #e6e5e0;
          --tw-prose-quotes: #1a1a1a;
          --tw-prose-quote-borders: #e6e5e0;
          --tw-prose-captions: #6b6b6b;
          --tw-prose-code: #1a1a1a;
          --tw-prose-pre-code: #e6e5e0;
          --tw-prose-pre-bg: #1a1a1a;
          --tw-prose-th-borders: #e6e5e0;
          --tw-prose-td-borders: #e6e5e0;
        }

        /* Hide scrollbar everywhere */
        .overflow-y-auto,
        .overflow-auto,
        .overflow-x-auto {
          -ms-overflow-style: none; /* IE and Edge */
          scrollbar-width: none; /* Firefox */
        }
        .overflow-y-auto::-webkit-scrollbar,
        .overflow-auto::-webkit-scrollbar,
        .overflow-x-auto::-webkit-scrollbar {
          display: none; /* Chrome, Safari and Opera */
        }
      `}</style>

      {/* Top Navbar */}
      <HomeNavbar maxWidth={1400} />

      {/* Main Content Area - Below Navbar */}
      <div className="relative z-10 pt-[61px]">
        <div className="mx-auto flex w-full max-w-[1400px] items-start px-4 md:px-6">
          <ProfileLeftSidebar userUuid={id} isOwnProfile={isOwnProfile} />
          {/* Main Content */}
          <main className="min-w-0 flex-1 py-8 lg:border-l lg:border-[color:var(--border)] lg:pl-10">
              {/* Profile Header */}
              {isProfileLoading ? (
                <div className="mb-8 border-b border-border pb-8">
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-muted-foreground">
                      Loading profile...
                    </span>
                  </div>
                </div>
              ) : isProfileError ? (
                <div className="mb-8 border-b border-border pb-8">
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-[#0A0A0A]/70 mb-4" />
                    <p className="text-muted-foreground">Failed to load profile</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 border-b border-border pb-8"
                >
                  <div className="flex flex-col md:flex-row gap-8 items-start">
                    <div className="flex-shrink-0 relative group">
                      <Avatar className="h-32 w-32 cursor-pointer overflow-hidden">
                        <AvatarImage
                          src={
                            profilePicPreview ||
                            getIpfsUrl(profileData?.profile?.profilePic) ||
                            undefined
                          }
                          alt={userData.name}
                          className="object-cover w-full h-full"
                        />
                        <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                          {userData.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </AvatarFallback>
                      </Avatar>
                      {/* Upload overlay - only visible on hover or when uploading */}
                      {isUploadingProfilePic ? (
                        <div className="absolute inset-0 rounded-full bg-foreground/50 flex items-center justify-center z-20">
                          <Loader2 className="w-8 h-8 animate-spin text-background" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 rounded-full bg-transparent group-hover:bg-foreground/50 transition-all flex flex-col items-center justify-center z-20 pointer-events-none">
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center">
                            <Upload className="w-6 h-6 text-background" />
                            <p className="text-xs text-background mt-1">Upload</p>
                          </div>
                        </div>
                      )}
                      {/* Hidden file input */}
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleProfilePicChange}
                        className="hidden"
                        id="profile-pic-upload-main"
                        disabled={isUploadingProfilePic}
                      />
                      {/* Clickable area - transparent button */}
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute inset-0 rounded-full cursor-pointer z-30"
                        disabled={isUploadingProfilePic}
                        aria-label="Upload profile picture"
                      />
                    </div>

                    <div className="flex-grow flex flex-col md:flex-row gap-6">
                      {/* Left side - Name, Bio, Info */}
                      <div className="flex-1">
                        <h1 className={`${display} text-[clamp(1.9rem,4vw,3rem)] font-black uppercase leading-[0.95] tracking-tight text-[#0A0A0A]`}>
                          {userData.name}
                        </h1>

                        {/* Single bulleted meta row */}
                        <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-[11px] uppercase tracking-[0.14em] text-[#0A0A0A]/55">
                          <span>@{userData.username}</span>

                          {userData.walletAddress && (
                            <>
                              <span className="text-[#0A0A0A]/30">·</span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleCopyWalletAddress(userData.walletAddress)
                                }
                                title={userData.walletAddress}
                                className="inline-flex items-center gap-1.5 normal-case transition-colors duration-150 hover:text-[#0A0A0A]"
                              >
                                <WalletIcon className="h-3.5 w-3.5" />
                                <span className="font-mono">
                                  {`${userData.walletAddress.slice(0, 6)}...${userData.walletAddress.slice(-4)}`}
                                </span>
                                {isAddressCopied ? (
                                  <Check className="h-3.5 w-3.5" />
                                ) : (
                                  <Copy className="h-3.5 w-3.5" />
                                )}
                              </button>
                            </>
                          )}

                          {userData.location && (
                            <>
                              <span className="text-[#0A0A0A]/30">·</span>
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="h-3.5 w-3.5" />
                                {userData.location}
                              </span>
                            </>
                          )}

                          {userData.website && (
                            <>
                              <span className="text-[#0A0A0A]/30">·</span>
                              <a
                                href={userData.website}
                                className="inline-flex items-center gap-1.5 normal-case underline-offset-4 transition-colors duration-150 hover:text-[#0A0A0A] hover:underline"
                              >
                                <LinkIcon className="h-3.5 w-3.5" />
                                {userData.website.replace(/^https?:\/\//, "")}
                              </a>
                            </>
                          )}

                          {userData.joinDate && (
                            <>
                              <span className="text-[#0A0A0A]/30">·</span>
                              <span className="inline-flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5" />
                                Joined {userData.joinDate}
                              </span>
                            </>
                          )}
                        </div>

                        {userData.bio && (
                          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[#0A0A0A]/70">
                            {userData.bio}
                          </p>
                        )}
                      </div>

                      {/* Right side - Follow button */}
                      <div className="flex flex-col items-start md:items-end gap-4">
                        {!isOwnProfile && currentUserId && (
                          <Button
                            onClick={
                              isFollowing ? handleUnfollow : handleFollow
                            }
                            disabled={isFollowPending || isFollowStatusLoading}
                            className={`rounded-none border border-[#0A0A0A] px-5 text-[11px] font-bold uppercase tracking-[0.14em] transition-colors duration-150 ${
                              isFollowing
                                ? "bg-[#0A0A0A] text-[#F5F4F0] hover:bg-[#F5F4F0] hover:text-[#0A0A0A]"
                                : "bg-transparent text-[#0A0A0A] hover:bg-[#0A0A0A] hover:text-[#F5F4F0]"
                            }`}
                          >
                            {isFollowPending ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {isFollowing
                                  ? "Unfollowing..."
                                  : "Following..."}
                              </>
                            ) : isFollowing ? (
                              <>
                                <UnfollowIcon className="h-4 w-4 mr-2" />
                                Unfollow
                              </>
                            ) : (
                              <>
                                <FollowIcon className="h-4 w-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Profile Content Tabs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                {isOwnProfile ? (
                  <div className="w-full">
                    {/* Tabs */}
                    <div className="mb-6 flex gap-8 overflow-x-auto border-b border-[color:var(--border)]">
                      {[
                        { key: "posts", label: "Posts" },
                        { key: "drafts", label: "Drafts" },
                        { key: "scored", label: "Scored" },
                        { key: "settings", label: "Settings" },
                        { key: "wallet", label: "Wallet" },
                        { key: "referral", label: "Referral" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`relative shrink-0 whitespace-nowrap py-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                            activeTab === tab.key
                              ? "text-[#0A0A0A]"
                              : "text-[#0A0A0A]/45 hover:text-[#0A0A0A]"
                          }`}
                        >
                          {tab.label}
                          {activeTab === tab.key && (
                            <motion.span
                              layoutId="profile-tab-indicator-own"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A]"
                              transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div>
                      {/* Posts Tab */}
                      {activeTab === "posts" && (
                        <div>
                          {isPostsLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                              <span className="ml-3 text-muted-foreground">
                                Loading posts...
                              </span>
                            </div>
                          ) : isPostsError ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <AlertCircle className="w-12 h-12 text-[#0A0A0A]/70 mb-4" />
                              <p className="text-muted-foreground">
                                Failed to load posts
                              </p>
                            </div>
                          ) : userPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No posts found</p>
                            </div>
                          ) : (
                            <div>
                              {userPosts.map((post) => (
                                <FeedPostCard key={post.id} post={post} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Drafts Tab */}
                      {activeTab === "drafts" && (
                        <div>
                          {isDraftsLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                              <span className="ml-3 text-muted-foreground">
                                Loading drafts...
                              </span>
                            </div>
                          ) : draftsError ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <AlertCircle className="w-12 h-12 text-[#0A0A0A]/70 mb-4" />
                              <p className="text-muted-foreground">
                                Failed to load drafts
                              </p>
                            </div>
                          ) : !draftsData || draftsData.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No drafts found</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                Start writing to create your first draft
                              </p>
                            </div>
                          ) : (
                            <div>
                              {draftsData.map((draft) => (
                                <article
                                  key={draft.uuid}
                                  className="border-b border-border"
                                >
                                  <Link
                                    href={`/create?draft=${draft.uuid}`}
                                    className="group block py-6"
                                  >
                                    <div className="mb-2 flex items-center gap-2">
                                      <span className="rounded bg-muted px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                        Draft
                                      </span>
                                      <span className="text-muted-foreground">·</span>
                                      <span className="text-[13px] text-muted-foreground">
                                        {formatDistanceToNow(
                                          new Date(draft.updatedAt),
                                          { addSuffix: true }
                                        )}
                                      </span>
                                    </div>
                                    <h2 className="text-[18px] font-bold leading-[1.25] tracking-[-0.01em] text-foreground md:text-[20px]">
                                      {draft.title || "(Untitled)"}
                                    </h2>
                                    {draft.content && (
                                      <p className="mt-1.5 line-clamp-2 text-[15px] leading-[1.5] text-muted-foreground">
                                        {draft.content.substring(0, 200)}
                                        {draft.content.length > 200 && "…"}
                                      </p>
                                    )}
                                  </Link>
                                </article>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Scored Tab */}
                      {activeTab === "scored" && (
                        <div>
                          {isScoredPostsLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                              <span className="ml-3 text-muted-foreground">
                                Loading scored posts...
                              </span>
                            </div>
                          ) : isScoredPostsError ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <AlertCircle className="w-12 h-12 text-[#0A0A0A]/70 mb-4" />
                              <p className="text-muted-foreground">
                                Failed to load scored posts
                              </p>
                            </div>
                          ) : scoredPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">
                                No scored posts found
                              </p>
                            </div>
                          ) : (
                            <div>
                              {scoredPosts.map((post) => (
                                <FeedPostCard key={post.id} post={post} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Settings Tab */}
                      {activeTab === "settings" && (
                        <div className="border-t border-[color:var(--border)] pt-8">
                          <h2 className={`${display} mb-6 text-2xl font-black uppercase tracking-tight text-[#0A0A0A]`}>
                            Profile Settings
                          </h2>
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Username */}
                              <div>
                                <label
                                  htmlFor="username"
                                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]/55"
                                >
                                  Username{" "}
                                  <span className="text-[#0A0A0A]/70">*</span>
                                </label>
                                <Input
                                  id="username"
                                  name="username"
                                  value={formData.username}
                                  onChange={handleInputChange}
                                  className="rounded-none border-0 border-b border-[#0A0A0A] bg-transparent px-0 shadow-none transition-all duration-150 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-[#0A0A0A]/40 focus-visible:border-b-2 focus-visible:ring-0"
                                  maxLength={30}
                                  required
                                />
                                <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A]/40">
                                  Max 30 characters
                                </p>
                              </div>

                              {/* Full Name */}
                              <div>
                                <label
                                  htmlFor="fullName"
                                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]/55"
                                >
                                  Full Name{" "}
                                  <span className="text-[#0A0A0A]/70">*</span>
                                </label>
                                <Input
                                  id="fullName"
                                  name="fullName"
                                  value={formData.fullName}
                                  onChange={handleInputChange}
                                  className="rounded-none border-0 border-b border-[#0A0A0A] bg-transparent px-0 shadow-none transition-all duration-150 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-[#0A0A0A]/40 focus-visible:border-b-2 focus-visible:ring-0"
                                  maxLength={100}
                                  required
                                />
                                <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A]/40">
                                  Max 100 characters
                                </p>
                              </div>
                            </div>

                            {/* Bio */}
                            <div>
                              <label
                                htmlFor="bio"
                                className="block text-sm font-medium text-foreground mb-2"
                              >
                                Bio
                              </label>
                              <Textarea
                                id="bio"
                                name="bio"
                                value={formData.bio}
                                onChange={handleInputChange}
                                className="min-h-[100px] rounded-none border-0 border-b border-[#0A0A0A] bg-transparent px-0 shadow-none transition-all duration-150 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-[#0A0A0A]/40 focus-visible:border-b-2 focus-visible:ring-0"
                                maxLength={300}
                                rows={4}
                              />
                              <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A]/40">
                                {formData.bio.length}/300 characters
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Location */}
                              <div>
                                <label
                                  htmlFor="location"
                                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]/55"
                                >
                                  Location
                                </label>
                                <Input
                                  id="location"
                                  name="location"
                                  value={formData.location}
                                  onChange={handleInputChange}
                                  className="rounded-none border-0 border-b border-[#0A0A0A] bg-transparent px-0 shadow-none transition-all duration-150 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-[#0A0A0A]/40 focus-visible:border-b-2 focus-visible:ring-0"
                                  maxLength={100}
                                  placeholder="e.g., San Francisco, CA"
                                />
                                <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A]/40">
                                  Max 100 characters
                                </p>
                              </div>

                              {/* Website */}
                              <div>
                                <label
                                  htmlFor="website"
                                  className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-[#0A0A0A]/55"
                                >
                                  Website
                                </label>
                                <Input
                                  id="website"
                                  name="website"
                                  type="url"
                                  value={formData.website}
                                  onChange={handleInputChange}
                                  className="rounded-none border-0 border-b border-[#0A0A0A] bg-transparent px-0 shadow-none transition-all duration-150 placeholder:uppercase placeholder:tracking-[0.1em] placeholder:text-[#0A0A0A]/40 focus-visible:border-b-2 focus-visible:ring-0"
                                  maxLength={200}
                                  placeholder="https://example.com"
                                />
                                <p className="mt-2 text-[10px] uppercase tracking-[0.12em] text-[#0A0A0A]/40">
                                  Must be a valid URL
                                </p>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4 border-t border-[color:var(--border)] pt-6">
                              <Button
                                type="button"
                                variant="outline"
                                className="rounded-none border border-[#0A0A0A] bg-transparent px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#0A0A0A] transition-colors duration-150 hover:bg-[#0A0A0A] hover:text-[#F5F4F0]"
                                onClick={() => {
                                  // Reset form to original values
                                  setFormData({ ...originalValues });
                                }}
                              >
                                Reset
                              </Button>
                              <SuccessButton
                                type="submit"
                                className="rounded-none border border-[#0A0A0A] bg-[#0A0A0A] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F5F4F0] transition-colors duration-150 hover:bg-[#F5F4F0] hover:text-[#0A0A0A]"
                                status={saveProfileStatus}
                                loadingChildren={
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                }
                              >
                                Save Changes
                              </SuccessButton>
                            </div>
                          </form>
                        </div>
                      )}

                      {/* Wallet Tab */}
                      {activeTab === "wallet" && (
                        <div>
                          <WalletTab />
                        </div>
                      )}

                      {/* Referral Tab */}
                      {activeTab === "referral" && (
                        <div>
                          <ReferralTab />
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Other user's profile - show Posts and Scored tabs
                  <div className="w-full">
                    {/* Tabs */}
                    <div className="mb-6 flex gap-8 overflow-x-auto border-b border-[color:var(--border)]">
                      {[
                        { key: "posts", label: "Posts" },
                        { key: "scored", label: "Scored" },
                      ].map((tab) => (
                        <button
                          key={tab.key}
                          onClick={() => setActiveTab(tab.key)}
                          className={`relative shrink-0 whitespace-nowrap py-4 text-[11px] font-bold uppercase tracking-[0.16em] transition-colors ${
                            activeTab === tab.key
                              ? "text-[#0A0A0A]"
                              : "text-[#0A0A0A]/45 hover:text-[#0A0A0A]"
                          }`}
                        >
                          {tab.label}
                          {activeTab === tab.key && (
                            <motion.span
                              layoutId="profile-tab-indicator-other"
                              className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#0A0A0A]"
                              transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Tab Content */}
                    <div>
                      {/* Posts Tab */}
                      {activeTab === "posts" && (
                        <div>
                          {isPostsLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                              <span className="ml-3 text-muted-foreground">
                                Loading posts...
                              </span>
                            </div>
                          ) : isPostsError ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <AlertCircle className="w-12 h-12 text-[#0A0A0A]/70 mb-4" />
                              <p className="text-muted-foreground">
                                Failed to load posts
                              </p>
                            </div>
                          ) : userPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">No posts found</p>
                            </div>
                          ) : (
                            <div>
                              {userPosts.map((post) => (
                                <FeedPostCard key={post.id} post={post} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Scored Tab */}
                      {activeTab === "scored" && (
                        <div>
                          {isScoredPostsLoading ? (
                            <div className="flex items-center justify-center py-12">
                              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                              <span className="ml-3 text-muted-foreground">
                                Loading scored posts...
                              </span>
                            </div>
                          ) : isScoredPostsError ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <AlertCircle className="w-12 h-12 text-[#0A0A0A]/70 mb-4" />
                              <p className="text-muted-foreground">
                                Failed to load scored posts
                              </p>
                            </div>
                          ) : scoredPosts.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                              <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                              <p className="text-muted-foreground">
                                No scored posts found
                              </p>
                            </div>
                          ) : (
                            <div>
                              {scoredPosts.map((post) => (
                                <FeedPostCard key={post.id} post={post} />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}
