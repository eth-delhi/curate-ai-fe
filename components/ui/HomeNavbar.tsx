"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  Search,
  PenSquare,
  Bell,
  Smartphone,
} from "lucide-react";
import { useUserProfile } from "@/hooks/api/profile";
import { useAuth } from "@/hooks/useAuth";
import {
  useNotifications,
  useMarkAllNotificationsAsRead,
  type NotificationResponseDto,
} from "@/hooks/api/notifications";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

interface HomeNavbarProps {
  className?: string;
  /** Medium-style top bar (logo left, search, Get app, write, bell, avatar) */
  variant?: "default" | "medium" | "scribe";
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

export default function HomeNavbar({
  className = "",
  variant = "default",
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
    if (id) {
      console.log("Navbar - User ID from token:", id);
    } else {
      console.log("Navbar - No user ID found in token");
    }
  }, []);

  // Fetch current user profile (only if userId is available)
  const { data: currentUserProfile, isLoading: isProfileLoading } =
    useUserProfile(userId || "");

  // Get profile picture URL
  const profilePicUrl = getIpfsUrl(currentUserProfile?.profile?.profilePic);

  // Debug log
  useEffect(() => {
    if (currentUserProfile) {
      console.log("Navbar - Profile data:", {
        profilePic: currentUserProfile?.profile?.profilePic,
        profilePicUrl: profilePicUrl,
        fullName: currentUserProfile?.profile?.fullName,
      });
    }
  }, [currentUserProfile, profilePicUrl]);

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

  const notificationIcon = variant === "medium" || variant === "scribe" ? (
    <Bell
      className={`stroke-[1.5] text-muted-foreground ${
        variant === "scribe" ? "h-5 w-5" : "h-6 w-6"
      }`}
    />
  ) : (
    <span className="text-[16px] leading-none">♡</span>
  );

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full bg-background border-b border-border z-[9999] ${className}`}
    >
      <div
        className={`w-full ${
          variant === "scribe"
            ? "px-6"
            : variant === "medium"
            ? "px-4 md:px-6"
            : "px-6"
        }`}
      >
        <div
          className={`mx-auto items-center gap-4 md:gap-6 ${
            variant === "medium"
              ? "flex h-[57px] max-w-[1600px]"
              : variant === "scribe"
              ? "grid h-[60px] w-full grid-cols-1 grid-rows-[auto_auto] md:grid-cols-[1fr_minmax(0,520px)_1fr] md:grid-rows-1 md:items-center"
              : "flex h-[57px]"
          }`}
        >
          {variant === "medium" ? (
            <>
              <Link
                href="/home-revamp"
                className="shrink-0 font-['Lora',serif] text-[26px] font-bold tracking-[-0.02em] text-foreground hover:opacity-90"
              >
                Medium
              </Link>
              <div className="flex min-w-0 flex-1 items-center md:max-w-[280px]">
                <button
                  type="button"
                  className="flex w-full items-center gap-2 rounded-full bg-muted px-4 py-2 text-left text-muted-foreground"
                >
                  <Search className="h-5 w-5 shrink-0 opacity-80" />
                  <span className="text-sm">Search</span>
                </button>
              </div>
            </>
          ) : variant === "scribe" ? (
            <>
              <div className="flex min-w-0 items-center justify-between gap-3 md:justify-start">
                <Link
                  href="/home-revamp"
                  className="flex shrink-0 items-center gap-2.5 text-foreground hover:opacity-90"
                >
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground text-background">
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      aria-hidden
                    >
                      <path d="M12 2L2 7l10 5 10-5-10-5z" />
                      <path d="M2 17l10 5 10-5" />
                      <path d="M2 12l10 5 10-5" />
                    </svg>
                  </span>
                  <span className="text-[28px] font-semibold tracking-tight">
                    Scribe
                  </span>
                </Link>
                <div className="flex min-w-0 flex-1 justify-end md:hidden">
                  {/* mobile: keep row compact; search stacks below */}
                </div>
              </div>
              <div className="flex min-w-0 justify-center px-0 md:px-4">
                <div className="flex w-full max-w-[520px] items-center gap-3 rounded-[24px] bg-muted px-5 py-2.5">
                  <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search"
                    className="w-full bg-transparent text-[15px] text-foreground outline-none placeholder:text-muted-foreground"
                  />
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="flex min-w-0 items-center">
                {isAuthenticated ? (
                  <Link
                    href="/home-revamp"
                    className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-90"
                  >
                    <span className="font-['Lora',serif] text-2xl font-bold tracking-[-0.5px] text-foreground">
                      Vertex
                      <span className="text-muted-foreground">·</span>
                    </span>
                  </Link>
                ) : (
                  <div className="flex shrink-0 items-center gap-2">
                    <span className="font-['Lora',serif] text-2xl font-bold tracking-[-0.5px] text-foreground">
                      Vertex
                      <span className="text-muted-foreground">·</span>
                    </span>
                  </div>
                )}
              </div>
              <div className="hidden cursor-text items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground md:flex">
                <span>⌕</span>
                <span>Search</span>
              </div>
              <div className="ml-auto hidden items-center gap-1.5 md:flex">
                <Link
                  href="/create-revamp"
                  className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent"
                  aria-label="Create post"
                >
                  <span>✎</span>
                  <span>Write</span>
                </Link>
                <span className="cursor-pointer rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent">
                  Our story
                </span>
                <span className="cursor-pointer rounded-full px-2.5 py-1.5 text-sm text-muted-foreground transition-colors duration-150 hover:bg-accent">
                  Membership
                </span>
              </div>
            </>
          )}

          <div
            className={`flex items-center ${
              variant === "scribe"
                ? "shrink-0 justify-end gap-7 justify-self-end md:justify-self-auto"
                : variant === "medium"
                ? "ml-auto shrink-0 gap-2 md:gap-3"
                : "gap-2"
            }`}
          >
            {!isAuthenticated && variant !== "scribe" && (
              <>
                <button className="rounded-full border border-foreground bg-transparent px-4 py-[7px] text-sm font-medium text-foreground transition-colors duration-150 hover:bg-accent">
                  Sign in
                </button>
                <button className="rounded-full border-none bg-primary px-[18px] py-2 text-sm font-medium text-primary-foreground transition-colors duration-150 hover:bg-primary/90">
                  Get started
                </button>
              </>
            )}
            {isAuthenticated && variant === "medium" && (
              <button
                type="button"
                className="hidden items-center gap-2 rounded-full bg-foreground px-3 py-1.5 text-sm font-medium text-background sm:flex"
              >
                <Smartphone className="h-4 w-4 shrink-0" />
                Get app
              </button>
            )}
            {(variant === "scribe" || isAuthenticated) &&
              (variant === "medium" || variant === "scribe") && (
              <Link
                href="/create-revamp"
                className={`${
                  variant === "scribe"
                    ? "flex items-center gap-2.5 text-[15px] font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground"
                    : "flex h-9 w-9 items-center justify-center text-muted-foreground transition-colors duration-150 hover:text-foreground"
                }`}
                aria-label="Write"
              >
                <PenSquare
                  className={`stroke-[1.5] ${variant === "scribe" ? "h-6 w-6" : "h-6 w-6"}`}
                />
                {variant === "scribe" && <span>Write</span>}
              </Link>
            )}
            {variant === "default" && (
              <button
                onClick={() => {
                  setIsProfileOpen(!isProfileOpen);
                  setIsNotificationsOpen(false);
                }}
                className="hidden h-8 w-8 cursor-pointer items-center justify-center rounded-md text-muted-foreground transition-colors duration-150 hover:bg-accent md:flex"
                aria-label="Open profile menu"
              >
                ☰
              </button>
            )}

            {(isAuthenticated || variant === "scribe") && (
              <div className="relative">
                <button
                  ref={notificationButtonRef}
                  onClick={async () => {
                    if (!isAuthenticated) return;
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
                  className={`relative flex h-9 w-9 items-center justify-center ${
                    variant === "medium" || variant === "scribe"
                      ? ""
                      : "hidden md:flex rounded-full transition-colors duration-150 hover:bg-accent"
                  }`}
                  aria-label="Notifications"
                >
                  {notificationIcon}
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
                                  ? `/post-revamp/${notification.postUuid}`
                                  : notification.actorUuid
                                  ? `/profile-revamp/${notification.actorUuid}`
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
                                        notification.actor?.profile?.fullName ||
                                        "User"
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
            )}

            {(isAuthenticated || variant === "scribe") && (
              <>
                <button
                  ref={profileButtonRef}
                  onClick={() => {
                    if (!isAuthenticated) return;
                    setIsProfileOpen(!isProfileOpen);
                    setIsNotificationsOpen(false);
                  }}
                  className={`flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full ${
                    variant === "scribe"
                      ? "bg-primary"
                      : "border border-border bg-background"
                  }`}
                  aria-label="Profile menu"
                >
                  <Avatar className="h-8 w-8 rounded-full">
                    <AvatarImage
                      src={profilePicUrl || undefined}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                    <AvatarFallback
                      className={`flex h-full w-full items-center justify-center text-center text-xs font-medium leading-none ${
                        variant === "scribe"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted-foreground text-background"
                      }`}
                    >
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
                        href={userId ? `/profile-revamp/${userId}` : "/profile"}
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
                            console.error("Error clearing localStorage:", error);
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
