"use client";

import { useState, useEffect, use, useRef } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import HomeNavbar from "@/components/ui/HomeNavbar";
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
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { showToast } from "@/utils/showToast";
import { useAccount, useBalance, useSendTransaction } from "wagmi";
import { ProfileLeftSidebar } from "@/components/profile/ProfileLeftSidebar";
import { parseUnits, formatUnits, isAddress } from "viem";
import {
  useReadCuratAiTokenDecimals,
  useWriteCuratAiTokenTransfer,
} from "@/hooks/wagmi/contracts";
import { contract } from "@/constants/contract";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { Upload, X } from "lucide-react";
import {
  TOKEN_CONTRACTS,
  TOKEN_DISPLAY_NAMES,
  NATIVE_TOKEN_SYMBOL,
} from "@/constants/chain";
import {
  Edit2,
  Calendar,
  MapPin,
  LinkIcon,
  Twitter,
  Github,
  Settings as SettingsIcon,
  FileText,
  BarChart2,
  Wallet,
  Heart,
  MessageSquare,
  MessageCircle,
  Eye,
  Clock,
  MoreHorizontal,
  Loader2,
  AlertCircle,
  Send,
  Wallet as WalletIcon,
  UserPlus,
  UserMinus,
} from "lucide-react";

// Wallet Tab Component
function WalletTab() {
  const { address: userAddress } = useAccount();
  const [activeTokenTab, setActiveTokenTab] = useState<"CAT" | "SONIC">("CAT");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);

  // Fetch CAT token balance
  const { balance: catBalance, refetch: refetchCatBalance } =
    useCatTokenBalance();

  // Fetch CAT token decimals
  const { data: catDecimals } = useReadCuratAiTokenDecimals({
    address: contract.token as `0x${string}`,
  });

  // Fetch SONIC (native) balance
  const { data: sonicBalance, refetch: refetchSonicBalance } = useBalance({
    address: userAddress,
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

    if (!recipientAddress || !isAddress(recipientAddress)) {
      showToast({
        message: "Please enter a valid recipient address",
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
        // Transfer CAT token
        if (catDecimals === undefined || catDecimals === null) {
          showToast({
            message: "Token decimals not loaded. Please wait...",
            type: "error",
          });
          setIsTransferring(false);
          return;
        }
        const decimals = Number(catDecimals);
        const amount = parseUnits(transferAmount, decimals);
        if (catBalance && catBalance < amount) {
          showToast({
            message: "Insufficient CAT balance",
            type: "error",
          });
          setIsTransferring(false);
          return;
        }

        await transferCatToken({
          address: contract.token as `0x${string}`,
          args: [recipientAddress as `0x${string}`, amount],
        });

        showToast({
          message: "CAT tokens transferred successfully",
          type: "success",
        });

        // Refetch balances
        refetchCatBalance();
      } else {
        // Transfer SONIC (native token)
        // Native tokens always use 18 decimals
        const amount = parseUnits(transferAmount, 18);
        if (sonicBalance?.value && sonicBalance.value < amount) {
          showToast({
            message: "Insufficient SONIC balance",
            type: "error",
          });
          setIsTransferring(false);
          return;
        }

        await sendSonicTransaction({
          to: recipientAddress as `0x${string}`,
          value: amount,
        });

        showToast({
          message: "SONIC transferred successfully",
          type: "success",
        });

        // Refetch balances
        refetchSonicBalance();
      }

      // Reset form
      setRecipientAddress("");
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

  return (
    <div className="space-y-6">
      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CAT Balance Card */}
        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-3">
                <WalletIcon className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {TOKEN_DISPLAY_NAMES.CAT} Balance
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {formatCatBalance()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* SONIC Balance Card */}
        <div className="bg-background rounded-xl p-6 border border-border">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mr-3">
                <WalletIcon className="w-6 h-6 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">
                  {TOKEN_DISPLAY_NAMES.SONIC} Balance
                </h3>
                <p className="text-2xl font-bold text-foreground">
                  {sonicBalance ? formatGasTokenBalance() : "0.00"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Transfer Form */}
      <div className="bg-background rounded-xl p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-6">
          Transfer Tokens
        </h2>

        {/* Token Type Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTokenTab("CAT")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTokenTab === "CAT"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {TOKEN_DISPLAY_NAMES.CAT}
            </button>
            <button
              onClick={() => setActiveTokenTab("SONIC")}
              className={`px-4 py-2 text-sm font-medium transition-colors ${
                activeTokenTab === "SONIC"
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {TOKEN_DISPLAY_NAMES.SONIC}
            </button>
          </div>
        </div>

        {/* Transfer Form */}
        <div className="space-y-4">
          <div>
            <label
              htmlFor="recipient"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Recipient Address
            </label>
            <Input
              id="recipient"
              type="text"
              placeholder="0x..."
              value={recipientAddress}
              onChange={(e) => setRecipientAddress(e.target.value)}
              className="border-border font-mono text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-foreground mb-2"
            >
              Amount (
              {activeTokenTab === "CAT"
                ? TOKEN_DISPLAY_NAMES.CAT
                : TOKEN_DISPLAY_NAMES.SONIC}
              )
            </label>
            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="any"
                placeholder="0.00"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                className="border-border"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {activeTokenTab === "CAT"
                  ? TOKEN_DISPLAY_NAMES.CAT
                  : TOKEN_DISPLAY_NAMES.SONIC}
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Available:{" "}
              {activeTokenTab === "CAT"
                ? formatCatBalance()
                : formatGasTokenBalance()}{" "}
              {activeTokenTab === "CAT"
                ? TOKEN_DISPLAY_NAMES.CAT
                : TOKEN_DISPLAY_NAMES.SONIC}
            </p>
          </div>

          <Button
            onClick={handleTransfer}
            disabled={isLoading || isTransferring || !userAddress}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isLoading || isTransferring ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Transferring...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Transfer{" "}
                {activeTokenTab === "CAT"
                  ? TOKEN_DISPLAY_NAMES.CAT
                  : TOKEN_DISPLAY_NAMES.SONIC}
              </>
            )}
          </Button>

          {!userAddress && (
            <p className="text-sm text-amber-600 text-center">
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
  const [activeTab, setActiveTab] = useState("posts");
  const [profilePicPreview, setProfilePicPreview] = useState<string | null>(
    null
  );
  const [isUploadingProfilePic, setIsUploadingProfilePic] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

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
    xHandle: "",
    github: "",
  });

  // Original values from API (for comparison)
  const [originalValues, setOriginalValues] = useState({
    username: "",
    fullName: "",
    bio: "",
    location: "",
    website: "",
    xHandle: "",
    github: "",
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
        twitter: profileData.profile?.xHandle
          ? `@${profileData.profile.xHandle}`
          : "",
        github: profileData.profile?.github || "",
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
      }
    : {
        name: "Loading...",
        username: "loading",
        avatar: "/placeholder.svg?height=200&width=200",
        bio: "",
        location: "",
        website: "",
        twitter: "",
        github: "",
        joinDate: "",
        followers: 0,
        following: 0,
        posts: 0,
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
        xHandle: (profileData.profile.xHandle || "").trim(),
        github: (profileData.profile.github || "").trim(),
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

      showToast({
        message: "Profile picture updated successfully",
        type: "success",
      });

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
        xHandle?: string;
        github?: string;
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
      if (hasChanged(formData.xHandle, originalValues.xHandle)) {
        console.log(
          `xHandle changed: "${originalValues.xHandle}" -> "${formData.xHandle}"`
        );
        updateData.xHandle = formData.xHandle.trim();
      }
      if (hasChanged(formData.github, originalValues.github)) {
        console.log(
          `Github changed: "${originalValues.github}" -> "${formData.github}"`
        );
        updateData.github = formData.github.trim();
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

      await updateProfileMutation.mutateAsync({
        id: id,
        data: updateData,
      });

      // Profile will automatically refetch via query invalidation/refetch
      // The useEffect will update formData and originalValues when new data arrives

      showToast({
        message: "Profile updated successfully",
        type: "success",
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
      await followUserMutation.mutateAsync({
        followingUuid: id,
      });
      showToast({
        message: "You are now following this user",
        type: "success",
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
      showToast({
        message: "You unfollowed this user",
        type: "success",
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
    <div className="profile-page flex h-screen flex-col bg-background text-foreground">
      <style jsx global>{`
        .profile-page {
          font-family: var(--font-sans), system-ui, sans-serif;
        }

        .prose {
          --tw-prose-headings: #1a1a1a;
          --tw-prose-body: #1a1a1a;
          --tw-prose-links: #072f5f;
          --tw-prose-bold: #1a1a1a;
          --tw-prose-counters: #6b6b6b;
          --tw-prose-bullets: #e6e5e0;
          --tw-prose-hr: #e6e5e0;
          --tw-prose-quotes: #1a1a1a;
          --tw-prose-quote-borders: #e6e5e0;
          --tw-prose-captions: #6b6b6b;
          --tw-prose-code: #1a1a1a;
          --tw-prose-pre-code: #1a1a1a;
          --tw-prose-pre-bg: #fafaf8;
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
      <HomeNavbar />

      {/* Main Content Area - Below Navbar */}
      <div className="flex flex-1 overflow-hidden pt-[60px]">
        {/* Content Area */}
        <div className="flex flex-1 overflow-hidden bg-background">
          <ProfileLeftSidebar userUuid={id} />
          {/* Main Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="mx-auto w-full max-w-[1040px] px-6 py-6">
              {/* Profile Header */}
              {isProfileLoading ? (
                <div className="mb-8">
                  <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    <span className="ml-3 text-muted-foreground">
                      Loading profile...
                    </span>
                  </div>
                </div>
              ) : isProfileError ? (
                <div className="mb-8">
                  <div className="flex flex-col items-center justify-center py-12">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                    <p className="text-muted-foreground">Failed to load profile</p>
                  </div>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 pt-8"
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
                        <AvatarFallback className="text-3xl bg-muted-foreground text-background">
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
                        <div className="mb-4">
                          <h1 className="text-3xl font-serif font-bold text-foreground mb-1">
                            {userData.name}
                          </h1>
                          <p className="text-muted-foreground">@{userData.username}</p>
                        </div>

                        {userData.bio && (
                          <p className="text-foreground mb-4">{userData.bio}</p>
                        )}

                        <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-muted-foreground">
                          {userData.location && (
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                              {userData.location}
                            </div>
                          )}
                          {userData.website && (
                            <div className="flex items-center">
                              <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                              <a
                                href={userData.website}
                                className="text-muted-foreground hover:underline"
                              >
                                {userData.website.replace(/^https?:\/\//, "")}
                              </a>
                            </div>
                          )}
                          {userData.joinDate && (
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                              Joined {userData.joinDate}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right side - Follow button and Social Links */}
                      <div className="flex flex-col items-start md:items-end gap-4">
                        {!isOwnProfile && currentUserId && (
                          <Button
                            onClick={
                              isFollowing ? handleUnfollow : handleFollow
                            }
                            disabled={isFollowPending || isFollowStatusLoading}
                            className={`${
                              isFollowing
                                ? "bg-muted hover:bg-muted text-foreground"
                                : "bg-primary hover:bg-primary/90 text-primary-foreground"
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
                                <UserMinus className="h-4 w-4 mr-2" />
                                Unfollow
                              </>
                            ) : (
                              <>
                                <UserPlus className="h-4 w-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                        )}

                        {/* Social Links */}
                        <div className="flex flex-col gap-2 items-end">
                          {userData.twitter && (
                            <a
                              href={`https://twitter.com/${userData.twitter.replace(
                                "@",
                                ""
                              )}`}
                              className="flex items-center text-muted-foreground hover:text-foreground text-sm"
                            >
                              <Twitter className="h-4 w-4 mr-1.5" />
                              <span>{userData.twitter}</span>
                            </a>
                          )}
                          {userData.github && (
                            <a
                              href={`https://github.com/${userData.github}`}
                              className="flex items-center text-foreground hover:text-foreground text-sm"
                            >
                              <Github className="h-4 w-4 mr-1.5" />
                              <span>{userData.github}</span>
                            </a>
                          )}
                        </div>
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
                    <div className="mb-8 flex gap-8 border-b border-border">
                      <button
                        onClick={() => setActiveTab("posts")}
                        className={`relative py-4 text-[15px] font-medium transition-colors ${
                          activeTab === "posts"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Posts
                        {activeTab === "posts" && (
                          <span className="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("drafts")}
                        className={`relative py-4 text-[15px] font-medium transition-colors ${
                          activeTab === "drafts"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Drafts
                        {activeTab === "drafts" && (
                          <span className="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("scored")}
                        className={`relative py-4 text-[15px] font-medium transition-colors ${
                          activeTab === "scored"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Scored
                        {activeTab === "scored" && (
                          <span className="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("settings")}
                        className={`relative py-4 text-[15px] font-medium transition-colors ${
                          activeTab === "settings"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Settings
                        {activeTab === "settings" && (
                          <span className="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("wallet")}
                        className={`relative py-4 text-[15px] font-medium transition-colors ${
                          activeTab === "wallet"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Wallet
                        {activeTab === "wallet" && (
                          <span className="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
                        )}
                      </button>
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
                              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
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
                            <div className="bg-background rounded-lg">
                              {userPosts.map((post) => {
                                // Use real tags from API, format with # prefix
                                const tags =
                                  post.tags && post.tags.length > 0
                                    ? post.tags.map((tag: string) =>
                                        tag.startsWith("#") ? tag : `#${tag}`
                                      )
                                    : [];
                                const reactions =
                                  Math.floor(Math.random() * 50) + 10;
                                const comments =
                                  Math.floor(Math.random() * 20) + 5;

                                return (
                                  <Link
                                    key={post.id}
                                    href={`/post/${post.id}`}
                                  >
                                    <article className="cursor-pointer border-b border-border bg-background px-2 py-6 sm:px-4">
                                      <div className="flex items-start justify-between gap-4">
                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                          {/* Time Info */}
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-muted-foreground">
                                              {post.timeAgo || "Recently"}
                                            </span>
                                          </div>

                                          {/* Title */}
                                          <h3 className="mb-3 text-[24px] font-bold leading-[1.3] text-foreground transition-colors hover:text-primary">
                                            {post.title}
                                          </h3>

                                          {/* Tags */}
                                          {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                              {tags
                                                .slice(0, 4)
                                                .map(
                                                  (
                                                    tag: string,
                                                    index: number
                                                  ) => (
                                                    <span
                                                      key={index}
                                                      className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
                                                    >
                                                      {tag}
                                                    </span>
                                                  )
                                                )}
                                            </div>
                                          )}

                                          {/* Engagement Metrics */}
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                              <Heart className="w-4 h-4" />
                                              <span>{reactions}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <MessageCircle className="w-4 h-4" />
                                              <span>{comments}</span>
                                            </div>
                                            <span className="text-muted-foreground">
                                              {post.readTime || "0 min read"}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Thumbnail Image - Right Side */}
                                        {post.imageUrl && (
                                          <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                              src={post.imageUrl}
                                              alt={post.title}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </article>
                                  </Link>
                                );
                              })}
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
                              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
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
                            <div className="bg-background rounded-lg">
                              {draftsData.map((draft) => {
                                return (
                                  <Link
                                    key={draft.uuid}
                                    href={`/create?draft=${draft.uuid}`}
                                  >
                                    <article className="cursor-pointer border-b border-border bg-background px-2 py-6 sm:px-4">
                                      <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-xs px-2 py-0.5 bg-muted text-muted-foreground rounded">
                                              Draft
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                              ·
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                              {formatDistanceToNow(
                                                new Date(draft.updatedAt),
                                                { addSuffix: true }
                                              )}
                                            </span>
                                          </div>
                                          <h3 className="mb-3 text-[24px] font-bold leading-[1.3] text-foreground transition-colors hover:text-primary">
                                            {draft.title || "(Untitled)"}
                                          </h3>
                                          {draft.content && (
                                            <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                                              {draft.content.substring(0, 200)}
                                              {draft.content.length > 200 &&
                                                "..."}
                                            </p>
                                          )}
                                        </div>
                                        {/* Thumbnail placeholder for drafts - can be empty or show a default */}
                                        <div className="w-32 h-24 rounded-lg bg-muted flex-shrink-0"></div>
                                      </div>
                                    </article>
                                  </Link>
                                );
                              })}
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
                              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
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
                            <div className="bg-background rounded-lg">
                              {scoredPosts.map((post) => {
                                const tags = [
                                  "#webdev",
                                  "#career",
                                  "#beginners",
                                ];
                                const reactions =
                                  Math.floor(Math.random() * 50) + 10;
                                const comments =
                                  Math.floor(Math.random() * 20) + 5;

                                return (
                                  <Link
                                    key={post.id}
                                    href={`/post/${post.id}`}
                                  >
                                    <article className="cursor-pointer border-b border-border bg-background px-2 py-6 sm:px-4">
                                      <div className="flex items-start justify-between gap-4">
                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                          {/* Time Info */}
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-muted-foreground">
                                              {post.timeAgo || "Recently"}
                                            </span>
                                          </div>

                                          {/* Title */}
                                          <h3 className="mb-3 text-[24px] font-bold leading-[1.3] text-foreground transition-colors hover:text-primary">
                                            {post.title}
                                          </h3>

                                          {/* Tags */}
                                          <div className="flex flex-wrap gap-2 mb-3">
                                            {tags
                                              .slice(0, 4)
                                              .map(
                                                (
                                                  tag: string,
                                                  index: number
                                                ) => (
                                                  <span
                                                    key={index}
                                                    className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
                                                  >
                                                    {tag}
                                                  </span>
                                                )
                                              )}
                                          </div>

                                          {/* Engagement Metrics */}
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                              <Heart className="w-4 h-4" />
                                              <span>{reactions}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <MessageCircle className="w-4 h-4" />
                                              <span>{comments}</span>
                                            </div>
                                            <span className="text-muted-foreground">
                                              {post.readTime || "0 min read"}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Thumbnail Image - Right Side */}
                                        {post.imageUrl && (
                                          <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                              src={post.imageUrl}
                                              alt={post.title}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </article>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Settings Tab */}
                      {activeTab === "settings" && (
                        <div>
                          <h2 className="text-xl font-bold text-foreground mb-6">
                            Profile Settings
                          </h2>
                          <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Username */}
                              <div>
                                <label
                                  htmlFor="username"
                                  className="block text-sm font-medium text-foreground mb-2"
                                >
                                  Username{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  id="username"
                                  name="username"
                                  value={formData.username}
                                  onChange={handleInputChange}
                                  className="border-border"
                                  maxLength={30}
                                  required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Max 30 characters
                                </p>
                              </div>

                              {/* Full Name */}
                              <div>
                                <label
                                  htmlFor="fullName"
                                  className="block text-sm font-medium text-foreground mb-2"
                                >
                                  Full Name{" "}
                                  <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  id="fullName"
                                  name="fullName"
                                  value={formData.fullName}
                                  onChange={handleInputChange}
                                  className="border-border"
                                  maxLength={100}
                                  required
                                />
                                <p className="text-xs text-muted-foreground mt-1">
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
                                className="border-border min-h-[100px]"
                                maxLength={300}
                                rows={4}
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                {formData.bio.length}/300 characters
                              </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* Location */}
                              <div>
                                <label
                                  htmlFor="location"
                                  className="block text-sm font-medium text-foreground mb-2"
                                >
                                  Location
                                </label>
                                <Input
                                  id="location"
                                  name="location"
                                  value={formData.location}
                                  onChange={handleInputChange}
                                  className="border-border"
                                  maxLength={100}
                                  placeholder="e.g., San Francisco, CA"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Max 100 characters
                                </p>
                              </div>

                              {/* Website */}
                              <div>
                                <label
                                  htmlFor="website"
                                  className="block text-sm font-medium text-foreground mb-2"
                                >
                                  Website
                                </label>
                                <Input
                                  id="website"
                                  name="website"
                                  type="url"
                                  value={formData.website}
                                  onChange={handleInputChange}
                                  className="border-border"
                                  maxLength={200}
                                  placeholder="https://example.com"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Must be a valid URL
                                </p>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              {/* X (Twitter) Handle */}
                              <div>
                                <label
                                  htmlFor="xHandle"
                                  className="block text-sm font-medium text-foreground mb-2"
                                >
                                  X (Twitter) Handle
                                </label>
                                <div className="flex items-center">
                                  <span className="text-muted-foreground mr-2">@</span>
                                  <Input
                                    id="xHandle"
                                    name="xHandle"
                                    value={formData.xHandle}
                                    onChange={handleInputChange}
                                    className="border-border"
                                    maxLength={50}
                                    placeholder="username"
                                  />
                                </div>
                                <p className="text-xs text-muted-foreground mt-1">
                                  Max 50 characters (without @)
                                </p>
                              </div>

                              {/* GitHub */}
                              <div>
                                <label
                                  htmlFor="github"
                                  className="block text-sm font-medium text-foreground mb-2"
                                >
                                  GitHub
                                </label>
                                <Input
                                  id="github"
                                  name="github"
                                  value={formData.github}
                                  onChange={handleInputChange}
                                  className="border-border"
                                  maxLength={50}
                                  placeholder="username"
                                />
                                <p className="text-xs text-muted-foreground mt-1">
                                  Max 50 characters
                                </p>
                              </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end gap-4 pt-4">
                              <Button
                                type="button"
                                variant="outline"
                                className="border-border text-muted-foreground"
                                onClick={() => {
                                  // Reset form to original values
                                  setFormData({ ...originalValues });
                                }}
                              >
                                Reset
                              </Button>
                              <Button
                                type="submit"
                                className="bg-primary hover:bg-primary/90 text-primary-foreground"
                                disabled={updateProfileMutation.isPending}
                              >
                                {updateProfileMutation.isPending ? (
                                  <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving...
                                  </>
                                ) : (
                                  "Save Changes"
                                )}
                              </Button>
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
                    </div>
                  </div>
                ) : (
                  // Other user's profile - show Posts and Scored tabs
                  <div className="w-full">
                    {/* Tabs */}
                    <div className="mb-8 flex gap-8 border-b border-border">
                      <button
                        onClick={() => setActiveTab("posts")}
                        className={`relative py-4 text-[15px] font-medium transition-colors ${
                          activeTab === "posts"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Posts
                        {activeTab === "posts" && (
                          <span className="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
                        )}
                      </button>
                      <button
                        onClick={() => setActiveTab("scored")}
                        className={`relative py-4 text-[15px] font-medium transition-colors ${
                          activeTab === "scored"
                            ? "text-primary"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Scored
                        {activeTab === "scored" && (
                          <span className="absolute bottom-0 left-0 right-0 h-px bg-primary"></span>
                        )}
                      </button>
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
                              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
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
                            <div className="bg-background rounded-lg">
                              {userPosts.map((post) => {
                                // Use real tags from API, format with # prefix
                                const tags =
                                  post.tags && post.tags.length > 0
                                    ? post.tags.map((tag: string) =>
                                        tag.startsWith("#") ? tag : `#${tag}`
                                      )
                                    : [];
                                const reactions =
                                  Math.floor(Math.random() * 50) + 10;
                                const comments =
                                  Math.floor(Math.random() * 20) + 5;

                                return (
                                  <Link
                                    key={post.id}
                                    href={`/post/${post.id}`}
                                  >
                                    <article className="cursor-pointer border-b border-border bg-background px-2 py-6 sm:px-4">
                                      <div className="flex items-start justify-between gap-4">
                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                          {/* Time Info */}
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-muted-foreground">
                                              {post.timeAgo || "Recently"}
                                            </span>
                                          </div>

                                          {/* Title */}
                                          <h3 className="mb-3 text-[24px] font-bold leading-[1.3] text-foreground transition-colors hover:text-primary">
                                            {post.title}
                                          </h3>

                                          {/* Tags */}
                                          {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                              {tags
                                                .slice(0, 4)
                                                .map(
                                                  (
                                                    tag: string,
                                                    index: number
                                                  ) => (
                                                    <span
                                                      key={index}
                                                      className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
                                                    >
                                                      {tag}
                                                    </span>
                                                  )
                                                )}
                                            </div>
                                          )}

                                          {/* Engagement Metrics */}
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                              <Heart className="w-4 h-4" />
                                              <span>{reactions}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <MessageCircle className="w-4 h-4" />
                                              <span>{comments}</span>
                                            </div>
                                            <span className="text-muted-foreground">
                                              {post.readTime || "0 min read"}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Thumbnail Image - Right Side */}
                                        {post.imageUrl && (
                                          <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                              src={post.imageUrl}
                                              alt={post.title}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </article>
                                  </Link>
                                );
                              })}
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
                              <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
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
                            <div className="bg-background rounded-lg">
                              {scoredPosts.map((post) => {
                                // Use real tags from API, format with # prefix
                                const tags =
                                  post.tags && post.tags.length > 0
                                    ? post.tags.map((tag: string) =>
                                        tag.startsWith("#") ? tag : `#${tag}`
                                      )
                                    : [];
                                const reactions =
                                  Math.floor(Math.random() * 50) + 10;
                                const comments =
                                  Math.floor(Math.random() * 20) + 5;

                                return (
                                  <Link
                                    key={post.id}
                                    href={`/post/${post.id}`}
                                  >
                                    <article className="cursor-pointer border-b border-border bg-background px-2 py-6 sm:px-4">
                                      <div className="flex items-start justify-between gap-4">
                                        {/* Main Content */}
                                        <div className="flex-1 min-w-0">
                                          {/* Time Info */}
                                          <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm text-muted-foreground">
                                              {post.timeAgo || "Recently"}
                                            </span>
                                          </div>

                                          {/* Title */}
                                          <h3 className="mb-3 text-[24px] font-bold leading-[1.3] text-foreground transition-colors hover:text-primary">
                                            {post.title}
                                          </h3>

                                          {/* Tags */}
                                          {tags.length > 0 && (
                                            <div className="flex flex-wrap gap-2 mb-3">
                                              {tags
                                                .slice(0, 4)
                                                .map(
                                                  (
                                                    tag: string,
                                                    index: number
                                                  ) => (
                                                    <span
                                                      key={index}
                                                      className="text-sm text-muted-foreground hover:text-primary cursor-pointer"
                                                    >
                                                      {tag}
                                                    </span>
                                                  )
                                                )}
                                            </div>
                                          )}

                                          {/* Engagement Metrics */}
                                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                              <Heart className="w-4 h-4" />
                                              <span>{reactions}</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                              <MessageCircle className="w-4 h-4" />
                                              <span>{comments}</span>
                                            </div>
                                            <span className="text-muted-foreground">
                                              {post.readTime || "0 min read"}
                                            </span>
                                          </div>
                                        </div>

                                        {/* Thumbnail Image - Right Side */}
                                        {post.imageUrl && (
                                          <div className="w-32 h-24 rounded-lg overflow-hidden bg-muted flex-shrink-0">
                                            <img
                                              src={post.imageUrl}
                                              alt={post.title}
                                              className="w-full h-full object-cover"
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </article>
                                  </Link>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
