"use client";

import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";
import { X, Loader2, AlertCircle } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  useUserFollowing,
  useUserFollowers,
  useFollowing,
  useFollowers,
  FollowUser,
} from "@/hooks/api/follows";
import Link from "next/link";

interface FollowersFollowingModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "followers" | "following";
  userUuid: string;
  isOwnProfile: boolean;
}

// Helper function to get IPFS URL from hash
const getIpfsUrl = (hash?: string | null): string | null => {
  if (!hash) return null;
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

// User item component
const UserItem = ({ user }: { user: FollowUser }) => {
  const profilePicUrl = getIpfsUrl(user.profile?.profilePic);
  // Use fullName from profile, fallback to email username if not available
  const displayName =
    user.profile?.fullName || user.email?.split("@")[0] || "User";
  // Use username from profile, fallback to email username if not available
  const username =
    user.profile?.username || user.email?.split("@")[0] || "user";
  // Generate initials from fullName or email
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <Link
      href={`/profile-revamp/${user.uuid}`}
      className="flex items-center gap-3 p-3 hover:bg-gray-50 rounded-lg transition-colors"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage
          src={profilePicUrl || undefined}
          alt={displayName}
          className="object-cover"
        />
        <AvatarFallback className="bg-gray-200 text-gray-700">
          {initials}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="font-medium text-gray-900 truncate">{displayName}</p>
        <p className="text-sm text-gray-500 truncate">@{username}</p>
      </div>
    </Link>
  );
};

export const FollowersFollowingModal = ({
  isOpen,
  onClose,
  type,
  userUuid,
  isOwnProfile,
}: FollowersFollowingModalProps) => {
  // Use different hooks based on whether it's own profile or someone else's
  const {
    data: ownFollowingData,
    isLoading: isOwnFollowingLoading,
    error: ownFollowingError,
  } = useFollowing();
  const {
    data: ownFollowersData,
    isLoading: isOwnFollowersLoading,
    error: ownFollowersError,
  } = useFollowers();
  const {
    data: userFollowingData,
    isLoading: isUserFollowingLoading,
    error: userFollowingError,
  } = useUserFollowing(userUuid);
  const {
    data: userFollowersData,
    isLoading: isUserFollowersLoading,
    error: userFollowersError,
  } = useUserFollowers(userUuid);

  // Select the appropriate data based on type and profile ownership
  const isLoading = isOwnProfile
    ? type === "following"
      ? isOwnFollowingLoading
      : isOwnFollowersLoading
    : type === "following"
    ? isUserFollowingLoading
    : isUserFollowersLoading;

  const error = isOwnProfile
    ? type === "following"
      ? ownFollowingError
      : ownFollowersError
    : type === "following"
    ? userFollowingError
    : userFollowersError;

  const data = isOwnProfile
    ? type === "following"
      ? ownFollowingData
      : ownFollowersData
    : type === "following"
    ? userFollowingData
    : userFollowersData;

  const title = type === "following" ? "Following" : "Followers";

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel
                className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <Dialog.Title className="text-xl font-bold text-gray-900">
                    {title}
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="rounded-lg p-2 hover:bg-gray-100 transition-colors"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                {/* Content */}
                <div
                  className="max-h-[60vh] overflow-y-auto"
                  onClick={(e) => e.stopPropagation()}
                >
                  {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
                      <span className="mt-3 text-gray-600">Loading...</span>
                    </div>
                  ) : error ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                      <p className="text-gray-600">Failed to load {title}</p>
                    </div>
                  ) : !data || data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <p className="text-gray-600">
                        No {title.toLowerCase()} found
                      </p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-100">
                      {data.map((user) => (
                        <UserItem key={user.uuid} user={user} />
                      ))}
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
