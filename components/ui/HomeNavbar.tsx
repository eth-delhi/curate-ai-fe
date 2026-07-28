"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, LogOut, Search, PenSquare, Bell, Loader2 } from "lucide-react";
import { useUserProfile } from "@/hooks/api/profile";
import { useAuth } from "@/hooks/useAuth";
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  type NotificationResponseDto,
} from "@/hooks/api/notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import { useAccount, useBalance } from "wagmi";
import { formatUnits } from "viem";
import { useCatTokenBalance } from "@/hooks/wagmi/useCatTokenBalance";
import { TOKEN_DISPLAY_NAMES, RPC_POLL_INTERVAL_MS } from "@/constants/chain";

interface HomeNavbarProps {
  className?: string;
  // Matches the max-width of the page's main body container so the navbar's
  // left/right edges line up with the content below it at every breakpoint
  // (LinkedIn-style). Defaults to the width used by the home/post feed.
  maxWidth?: number;
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

// Helper function to get IPFS URL from hash
const getIpfsUrl = (hash?: string | null): string | null => {
  if (!hash) return null;
  return `https://gateway.pinata.cloud/ipfs/${hash}`;
};

// Format notification message based on type
const formatNotificationMessage = (
  notification: NotificationResponseDto
): { title: string; message: string } => {
  const actorName =
    notification.actor?.profile?.fullName ||
    notification.actor?.profile?.username ||
    notification.actor?.email ||
    "Someone";

  switch (notification.type) {
    case "FOLLOWED":
      return {
        title: "New Follower",
        message: `${actorName} started following you`,
      };
    case "POST_SCORED":
      return {
        title: "Post Upvoted",
        message: `${actorName} upvoted your post "${
          notification.post?.title || "Untitled"
        }"`,
      };
    case "POST_CLAPPED":
      return {
        title: "Post Clapped",
        message: `${actorName} clapped on your post "${
          notification.post?.title || "Untitled"
        }"`,
      };
    case "FOLLOWED_USER_POSTED":
      return {
        title: "New Post",
        message: `${actorName} published a new post "${
          notification.post?.title || "Untitled"
        }"`,
      };
    default:
      return {
        title: "Notification",
        message: "You have a new notification",
      };
  }
};

// Real on-chain CAT + native token balance for the connected wallet.
// Same fetching pattern as components/home-revamp/LeftSidebar.tsx's
// WalletWidget, without the mocked USD conversion.
const WalletBalance = () => {
  const { address } = useAccount();
  const { balance: catBalance, isLoading: isCatBalanceLoading } =
    useCatTokenBalance();
  const { data: nativeBalance, isLoading: isNativeBalanceLoading } =
    useBalance({
      address,
      query: {
        refetchInterval: RPC_POLL_INTERVAL_MS,
        staleTime: RPC_POLL_INTERVAL_MS,
      },
    });

  // CAT amounts are whole base units — the token contract mints/distributes
  // unscaled values, so the ERC20's 18 decimals must not be applied.
  const formattedCatBalance = useMemo(
    () => (catBalance !== undefined ? Number(catBalance).toLocaleString() : "0"),
    [catBalance]
  );

  const formattedNativeBalance = useMemo(() => {
    if (!nativeBalance?.value) return "0.0000";
    try {
      return parseFloat(formatUnits(nativeBalance.value, 18)).toFixed(4);
    } catch {
      return "0.0000";
    }
  }, [nativeBalance]);

  if (!address) return null;

  const isLoading = isCatBalanceLoading || isNativeBalanceLoading;

  return (
    <div className="hidden shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-border bg-muted/50 px-3 py-1.5 text-xs font-medium text-foreground sm:flex">
      {isLoading ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
      ) : (
        <>
          <span>
            {formattedCatBalance} {TOKEN_DISPLAY_NAMES.CAT}
          </span>
          <span className="text-muted-foreground">·</span>
          <span>
            {formattedNativeBalance} {TOKEN_DISPLAY_NAMES.SONIC}
          </span>
        </>
      )}
    </div>
  );
};

export default function HomeNavbar({
  className = "",
  maxWidth = 1336,
}: HomeNavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [profileDropdownPosition, setProfileDropdownPosition] = useState({
    top: 0,
    right: 0,
  });
  const [notificationDropdownPosition, setNotificationDropdownPosition] =
    useState({
      top: 0,
      right: 0,
    });
  const profileButtonRef = useRef<HTMLButtonElement>(null);
  const notificationButtonRef = useRef<HTMLButtonElement>(null);
  const router = useRouter();

  // Check if user is authenticated
  const { isAuthenticated } = useAuth();

  // Fetch notifications (only if authenticated)
  const { data: notificationsData, isLoading: isNotificationsLoading } =
    useNotifications(
      {
        page: 1,
        limit: 20,
      },
      {
        enabled: isAuthenticated,
      }
    );

  // Mark all notifications as read mutation
  const markAllAsReadMutation = useMarkAllNotificationsAsRead();

  // Get unread count from API
  const unreadCount = notificationsData?.counts?.unread || 0;
  const notifications = notificationsData?.notifications || [];

  // Get user ID from token
  useEffect(() => {
    const id = getUserIdFromToken();
    setUserId(id);
  }, []);

  // Fetch current user profile (only if userId is available)
  const { data: currentUserProfile, isLoading: isProfileLoading } =
    useUserProfile(userId || "");

  // Get profile picture URL
  const profilePicUrl = getIpfsUrl(currentUserProfile?.profile?.profilePic);

  // Get user initials for fallback
  const userInitials =
    currentUserProfile?.profile?.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() || "U";

  // Calculate profile dropdown position when opening
  useEffect(() => {
    if (isProfileOpen && profileButtonRef.current) {
      const rect = profileButtonRef.current.getBoundingClientRect();
      setProfileDropdownPosition({
        top: rect.bottom + 8, // 8px = mt-2 spacing
        right: window.innerWidth - rect.right,
      });
    }
  }, [isProfileOpen]);

  // Calculate notification dropdown position when opening
  useEffect(() => {
    if (isNotificationsOpen && notificationButtonRef.current) {
      const rect = notificationButtonRef.current.getBoundingClientRect();
      setNotificationDropdownPosition({
        top: rect.bottom + 8, // 8px = mt-2 spacing
        right: window.innerWidth - rect.right,
      });
    }
  }, [isNotificationsOpen]);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full bg-background border-b border-border z-[9999] ${className}`}
    >
      <div className="w-full">
        <div
          className="mx-auto grid h-[60px] w-full grid-cols-1 grid-rows-[auto_auto] items-center gap-3 px-6 md:grid-cols-[auto_1fr_auto] md:grid-rows-1"
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {/* Logo */}
          <div className="flex min-w-0 items-center justify-between gap-3 md:justify-start">
            <Link
              href="/home"
              className="flex shrink-0 items-center gap-2.5 text-foreground transition-opacity duration-150 hover:opacity-90"
            >
              <Logo className="h-7 w-7 shrink-0 text-foreground" />
              <span className="font-serif text-xl font-semibold leading-none tracking-tight">
                Curate AI
              </span>
            </Link>
          </div>

          {/* Search */}
          <div className="flex min-w-0 justify-center px-0 md:px-4">
            <div className="flex w-full max-w-[360px] items-center gap-3 rounded-[24px] bg-muted px-5 py-2.5">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search"
                className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex shrink-0 items-center justify-end gap-5 justify-self-end md:justify-self-auto">
            {!isAuthenticated ? (
              <>
                <Link
                  href="/auth"
                  className="rounded-full border border-foreground bg-transparent px-4 py-[7px] text-sm font-medium text-foreground transition-colors duration-150 hover:bg-accent"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="rounded-full border-none bg-primary px-[18px] py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90"
                >
                  Get started
                </Link>
              </>
            ) : (
              <>
                <WalletBalance />

                <Link
                  href="/create"
                  className="flex shrink-0 items-center gap-2.5 whitespace-nowrap text-[15px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
                  aria-label="Write"
                >
                  <PenSquare className="h-6 w-6 stroke-[1.5]" />
                  <span>Write</span>
                </Link>

                <div className="relative shrink-0">
                  <button
                    ref={notificationButtonRef}
                    onClick={async () => {
                      const wasOpen = isNotificationsOpen;
                      setIsNotificationsOpen(!wasOpen);
                      setIsProfileOpen(false);

                      if (!wasOpen && unreadCount > 0) {
                        try {
                          await markAllAsReadMutation.mutateAsync();
                        } catch (error) {
                          console.error(
                            "Error marking all notifications as read:",
                            error
                          );
                        }
                      }
                    }}
                    className="relative flex h-9 w-9 shrink-0 items-center justify-center"
                    aria-label="Notifications"
                  >
                    <Bell className="h-5 w-5 stroke-[1.5] text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div
                      className="fixed bg-background border border-border rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto"
                      style={{
                        top: `${notificationDropdownPosition.top}px`,
                        right: `${notificationDropdownPosition.right}px`,
                        zIndex: 10001,
                      }}
                    >
                      <div className="p-4 border-b border-border">
                        <h3 className="text-sm font-semibold text-foreground">
                          Notifications
                        </h3>
                      </div>
                      <div className="py-1">
                        {isNotificationsLoading ? (
                          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            Loading notifications...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => {
                            const { title, message } =
                              formatNotificationMessage(notification);
                            const timeAgo = formatDistanceToNow(
                              new Date(notification.createdAt),
                              { addSuffix: true }
                            );
                            const actorProfilePic = getIpfsUrl(
                              notification.actor?.profile?.profilePic
                            );
                            const actorInitials =
                              notification.actor?.profile?.fullName
                                ?.split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase() || "U";

                            return (
                              <Link
                                key={notification.uuid}
                                href={
                                  notification.postUuid
                                    ? `/post/${notification.postUuid}`
                                    : notification.actorUuid
                                    ? `/profile/${notification.actorUuid}`
                                    : "#"
                                }
                                onClick={() => setIsNotificationsOpen(false)}
                                className={`block px-4 py-3 border-b border-border hover:bg-accent transition-colors duration-150 cursor-pointer ${
                                  !notification.read ? "bg-accent" : ""
                                }`}
                              >
                                <div className="flex items-start gap-3">
                                  <div className="flex-shrink-0">
                                    <Avatar className="w-8 h-8 border border-border">
                                      <AvatarImage
                                        src={actorProfilePic || undefined}
                                        alt={
                                          notification.actor?.profile
                                            ?.fullName || "User"
                                        }
                                      />
                                      <AvatarFallback className="bg-muted text-muted-foreground text-xs font-medium">
                                        {actorInitials}
                                      </AvatarFallback>
                                    </Avatar>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p
                                      className={`text-sm ${
                                        !notification.read
                                          ? "font-semibold text-foreground"
                                          : "font-medium text-muted-foreground"
                                      }`}
                                    >
                                      {title}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                      {message}
                                    </p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      {timeAgo}
                                    </p>
                                  </div>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1"></div>
                                  )}
                                </div>
                              </Link>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  ref={profileButtonRef}
                  onClick={() => {
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-primary"
                  aria-label="Profile menu"
                >
                  <Avatar className="h-9 w-9 shrink-0 rounded-full">
                    <AvatarImage
                      src={profilePicUrl || undefined}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                    <AvatarFallback className="flex h-full w-full items-center justify-center text-center text-xs font-medium leading-none bg-primary text-primary-foreground">
                      {isProfileLoading || !currentUserProfile ? (
                        <User className="h-4 w-4" />
                      ) : (
                        userInitials
                      )}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {isProfileOpen && (
                  <div
                    className="fixed w-52 rounded-lg border border-border bg-background shadow-xl"
                    style={{
                      top: `${profileDropdownPosition.top}px`,
                      right: `${profileDropdownPosition.right}px`,
                      zIndex: 10001,
                    }}
                  >
                    <div className="py-1">
                      <a
                        href={userId ? `/profile/${userId}` : "/profile"}
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-foreground transition-colors duration-150 hover:bg-accent"
                      >
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Profile</span>
                      </a>
                      <div className="my-1 border-t border-border"></div>
                      <button
                        onClick={() => {
                          try {
                            localStorage.clear();
                          } catch (error) {
                            console.error(
                              "Error clearing localStorage:",
                              error
                            );
                          } finally {
                            setIsProfileOpen(false);
                            router.push("/auth");
                          }
                        }}
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-sm text-foreground transition-colors duration-150 hover:bg-accent"
                      >
                        <LogOut className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">Logout</span>
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Click outside to close dropdowns */}
      {(isProfileOpen || isNotificationsOpen) && (
        <div
          className="fixed inset-0 z-[9999]"
          onClick={() => {
            setIsProfileOpen(false);
            setIsNotificationsOpen(false);
          }}
        />
      )}
    </nav>
  );
}
