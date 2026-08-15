"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { display } from "@/components/brutal";
import { Logo } from "@/components/ui/Logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  User,
  LogOut,
  Loader2,
  ChevronDown,
  Copy,
  Check,
  Send,
  Search,
  Settings,
  FileText,
} from "lucide-react";
import NavbarSearch from "@/components/ui/NavbarSearch";
import { BellIcon, WalletIcon } from "@/components/icons";
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
import { INTERESTS_ONBOARDING_KEY_PREFIX } from "@/utils/onboarding";

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

// Mask an email for the account menu, e.g. "su••••••••@gmail.com".
const maskEmail = (email?: string): string => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const visible = local.slice(0, 2);
  return `${visible}${"•".repeat(Math.max(3, local.length - 2))}@${domain}`;
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

// Real on-chain CAT + native token balance for the connected wallet, shown
// as a clickable pill that opens a small panel with the full address (copy)
// and a shortcut into the profile's Wallet tab. Same fetching pattern as
// components/home-revamp/LeftSidebar.tsx's WalletWidget, without the mocked
// USD conversion.
const WalletMenu = ({ userId }: { userId: string | null }) => {
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

  const [isOpen, setIsOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [position, setPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        buttonRef.current?.contains(target) ||
        panelRef.current?.contains(target)
      ) {
        return;
      }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

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

  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  if (!address) return null;

  const isLoading = isCatBalanceLoading || isNativeBalanceLoading;
  const shortAddress = `${address.slice(0, 6)}...${address.slice(-4)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (error) {
      console.error("Error copying address:", error);
    }
  };

  return (
    <div className="relative hidden shrink-0 sm:block">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-2 whitespace-nowrap border-b border-[#0A0A0A]/30 pb-0.5 text-[11px] font-medium uppercase tracking-[0.1em] text-[#0A0A0A] transition-colors duration-150 hover:border-[#0A0A0A]"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-[#0A0A0A]/50" />
        ) : (
          <>
            <span className="tabular-nums">
              {formattedCatBalance} {TOKEN_DISPLAY_NAMES.CAT}
            </span>
            <span className="text-[#0A0A0A]/40">·</span>
            <span className="tabular-nums">
              {formattedNativeBalance} {TOKEN_DISPLAY_NAMES.SONIC}
            </span>
            <ChevronDown
              className={`h-3 w-3 text-[#0A0A0A]/50 transition-transform duration-150 ${
                isOpen ? "rotate-180" : ""
              }`}
            />
          </>
        )}
      </button>

      {isOpen && (
        <div
          ref={panelRef}
          className="fixed w-72 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[#F5F4F0] shadow-xl"
          style={{ top: `${position.top}px`, right: `${position.right}px`, zIndex: 10001 }}
        >
          <div className="border-b border-[color:var(--border)] px-4 py-4">
            <p className="text-[10px] uppercase tracking-[0.18em] text-[#0A0A0A]/45">
              Wallet balance
            </p>
            <p className={`${display} mt-1.5 text-[26px] font-black leading-none tracking-tight text-[#0A0A0A]`}>
              {formattedCatBalance}{" "}
              <span className="text-[13px] text-[#0A0A0A]/45">
                {TOKEN_DISPLAY_NAMES.CAT}
              </span>
            </p>
            <p className="mt-1 text-[12px] tabular-nums text-[#0A0A0A]/55">
              {formattedNativeBalance} {TOKEN_DISPLAY_NAMES.SONIC}
            </p>
          </div>

          <div className="p-3">
            <button
              type="button"
              onClick={handleCopy}
              className="flex w-full items-center justify-between gap-2 rounded-lg border border-[color:var(--border)] px-3 py-2 text-left transition-colors duration-150 hover:bg-[#0A0A0A]/[0.04]"
            >
              <span className="truncate font-mono text-[11px] text-[#0A0A0A]">
                {shortAddress}
              </span>
              {isCopied ? (
                <Check className="h-3.5 w-3.5 shrink-0 text-[#0A0A0A]" />
              ) : (
                <Copy className="h-3.5 w-3.5 shrink-0 text-[#0A0A0A]/50" />
              )}
            </button>

            <Link
              href={userId ? `/profile/${userId}?tab=wallet` : "/auth"}
              onClick={() => setIsOpen(false)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg border border-[#0A0A0A] bg-[#0A0A0A] px-3 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F5F4F0] transition-colors duration-150 hover:bg-[#F5F4F0] hover:text-[#0A0A0A]"
            >
              <Send className="h-4 w-4" />
              Send tokens
            </Link>
          </div>
        </div>
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
      className={`fixed top-0 left-0 right-0 w-full border-b border-[color:var(--border)] bg-[#F5F4F0]/90 backdrop-blur-md z-[9999] ${className}`}
    >
      <div className="w-full">
        <div
          className="mx-auto grid h-[60px] w-full grid-cols-[auto_1fr_auto] items-center gap-3 px-4 md:px-6"
          style={{ maxWidth: `${maxWidth}px` }}
        >
          {/* Logo */}
          <div className="flex min-w-0 items-center justify-between gap-3 md:justify-start">
            <Link
              href="/home"
              aria-label="Curate AI home"
              className="flex shrink-0 items-center gap-2 transition-opacity duration-150 hover:opacity-90"
            >
              <Logo className="h-8 w-8 shrink-0 text-[#0A0A0A]" />
              <span className="text-[22px] font-bold leading-none tracking-tight text-[#0A0A0A]">
                Curate AI
              </span>
            </Link>
          </div>

          {/* Search — hidden on mobile (see the compact search icon below) */}
          <NavbarSearch />

          {/* Right actions */}
          <div className="flex shrink-0 items-center justify-end gap-3 justify-self-end sm:gap-5 md:justify-self-auto">
            {!isAuthenticated ? (
              <>
                {/* Hidden on the smallest screens so the logo + "Get started"
                    fit on one row; sign-in is still reachable from /auth. */}
                <Link
                  href="/auth"
                  className="hidden text-[11px] font-medium uppercase tracking-[0.14em] text-[#0A0A0A] underline-offset-4 transition-colors duration-150 hover:underline sm:inline-flex"
                >
                  Sign in
                </Link>
                <Link
                  href="/auth"
                  className="border-[1.5px] border-[#0A0A0A] bg-[#0A0A0A] px-4 py-2 text-[11px] font-bold uppercase tracking-[0.14em] text-[#F5F4F0] transition-colors duration-150 hover:bg-[#F5F4F0] hover:text-[#0A0A0A]"
                >
                  Get started
                </Link>
              </>
            ) : (
              <>
                {/* Compact search entry on mobile, where the full search bar is hidden */}
                <Link
                  href="/search"
                  aria-label="Search"
                  className="flex h-9 w-9 shrink-0 items-center justify-center text-[#0A0A0A]/70 transition-colors duration-150 hover:text-[#0A0A0A] md:hidden"
                >
                  <Search className="h-5 w-5 stroke-[1.5]" />
                </Link>

                <WalletMenu userId={userId} />

                <Link
                  href="/create"
                  aria-label="Write"
                  className={`group relative shrink-0 whitespace-nowrap text-[11px] font-bold uppercase tracking-[0.18em] text-[#0A0A0A] ${display}`}
                >
                  Write
                  <span className="absolute -bottom-1 left-0 h-px w-full origin-left scale-x-0 bg-[#0A0A0A] transition-transform duration-150 ease-linear group-hover:scale-x-100" />
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
                    <BellIcon className="h-5 w-5 stroke-[1.5] text-[#0A0A0A]/70" />
                    {unreadCount > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-4 min-w-[16px] items-center justify-center border border-[#0A0A0A] bg-[#0A0A0A] px-1 text-[9px] font-bold tabular-nums text-[#F5F4F0]">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </button>

                  {isNotificationsOpen && (
                    <div
                      className="fixed w-80 max-h-96 overflow-y-auto rounded-xl border border-[color:var(--border)] bg-[#F5F4F0] shadow-xl"
                      style={{
                        top: `${notificationDropdownPosition.top}px`,
                        right: `${notificationDropdownPosition.right}px`,
                        zIndex: 10001,
                      }}
                    >
                      <div className="border-b border-[color:var(--border)] px-4 py-3">
                        <h3 className={`${display} text-[10px] font-bold uppercase tracking-[0.2em] text-[#0A0A0A]`}>
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
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A]"
                  aria-label="Profile menu"
                >
                  <Avatar className="h-full w-full shrink-0 rounded-full">
                    <AvatarImage
                      src={profilePicUrl || undefined}
                      alt="Profile"
                      className="h-full w-full object-cover"
                    />
                    <AvatarFallback className="flex h-full w-full items-center justify-center rounded-full text-center text-[11px] font-bold leading-none bg-[#0A0A0A] text-[#F5F4F0]">
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
                    className="fixed w-64 overflow-hidden rounded-xl border border-[color:var(--border)] bg-[#F5F4F0] shadow-xl"
                    style={{
                      top: `${profileDropdownPosition.top}px`,
                      right: `${profileDropdownPosition.right}px`,
                      zIndex: 10001,
                    }}
                  >
                    {/* Header — avatar + name + view profile */}
                    <a
                      href={userId ? `/profile/${userId}` : "/auth"}
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-3 px-4 py-4 transition-colors duration-150 hover:bg-[#0A0A0A]/[0.04]"
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#0A0A0A]">
                        {profilePicUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={profilePicUrl}
                            alt=""
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-[13px] font-bold text-[#F5F4F0]">
                            {userInitials}
                          </span>
                        )}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate text-[15px] font-semibold text-[#0A0A0A]">
                          {currentUserProfile?.profile?.fullName || "Your profile"}
                        </p>
                        <p className="text-[12px] text-[#0A0A0A]/50">View profile</p>
                      </div>
                    </a>

                    <div className="border-t border-[color:var(--border)]" />

                    {/* Account links */}
                    <div className="py-1.5">
                      {[
                        {
                          label: "Profile",
                          href: userId ? `/profile/${userId}` : "/auth",
                          icon: <User className="h-[18px] w-[18px] shrink-0 text-[#0A0A0A]/55" strokeWidth={1.6} />,
                        },
                        {
                          label: "Drafts",
                          href: userId ? `/profile/${userId}?tab=drafts` : "/auth",
                          icon: <FileText className="h-[18px] w-[18px] shrink-0 text-[#0A0A0A]/55" strokeWidth={1.6} />,
                        },
                        {
                          label: "Wallet",
                          href: userId ? `/profile/${userId}?tab=wallet` : "/auth",
                          icon: <WalletIcon className="h-[18px] w-[18px] shrink-0 text-[#0A0A0A]/55" />,
                        },
                        {
                          label: "Settings",
                          href: userId ? `/profile/${userId}?tab=settings` : "/auth",
                          icon: <Settings className="h-[18px] w-[18px] shrink-0 text-[#0A0A0A]/55" strokeWidth={1.6} />,
                        },
                      ].map((item) => (
                        <a
                          key={item.label}
                          href={item.href}
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-[14px] text-[#0A0A0A] transition-colors duration-150 hover:bg-[#0A0A0A]/[0.04]"
                        >
                          {item.icon}
                          {item.label}
                        </a>
                      ))}
                    </div>

                    <div className="border-t border-[color:var(--border)]" />

                    {/* Sign out + account email */}
                    <div className="py-1.5">
                      <button
                        onClick={() => {
                          try {
                            // Preserve the one-time interest-onboarding markers
                            // so returning users aren't sent back through the
                            // interest picker after logging out and back in.
                            const preserved: Record<string, string> = {};
                            for (let i = 0; i < localStorage.length; i++) {
                              const key = localStorage.key(i);
                              if (
                                key?.startsWith(
                                  INTERESTS_ONBOARDING_KEY_PREFIX
                                )
                              ) {
                                const value = localStorage.getItem(key);
                                if (value !== null) preserved[key] = value;
                              }
                            }
                            localStorage.clear();
                            for (const [key, value] of Object.entries(
                              preserved
                            )) {
                              localStorage.setItem(key, value);
                            }
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
                        className="flex w-full cursor-pointer items-center gap-3 px-4 py-2.5 text-left text-[14px] text-[#0A0A0A] transition-colors duration-150 hover:bg-[#0A0A0A]/[0.04]"
                      >
                        <LogOut className="h-[18px] w-[18px] shrink-0 text-[#0A0A0A]/55" strokeWidth={1.6} />
                        Sign out
                      </button>
                      {currentUserProfile?.email && (
                        <p className="truncate px-4 pb-1 pt-0.5 text-[12px] text-[#0A0A0A]/45">
                          {maskEmail(currentUserProfile.email)}
                        </p>
                      )}
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
