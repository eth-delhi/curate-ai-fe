"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Search,
  User,
  LogOut,
  ChevronDown,
  NotebookPen,
  Bell,
  Wallet,
} from "lucide-react";
import { useUserProfile } from "@/hooks/api/profile";
import { useAuth } from "@/hooks/useAuth";

interface HomeNavbarProps {
  className?: string;
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

// Static notifications data
const STATIC_NOTIFICATIONS = [
  {
    id: 1,
    title: "New comment on your post",
    message: "John Doe commented on 'Getting Started with React'",
    time: "2h ago",
    isRead: false,
  },
  {
    id: 2,
    title: "Someone followed you",
    message: "Jane Smith started following you",
    time: "5h ago",
    isRead: false,
  },
  {
    id: 3,
    title: "Post liked",
    message: "Your post 'Understanding TypeScript' received 10 new likes",
    time: "1d ago",
    isRead: true,
  },
  {
    id: 4,
    title: "Weekly digest",
    message: "Here's what happened in your community this week",
    time: "2d ago",
    isRead: true,
  },
];

export default function HomeNavbar({ className = "" }: HomeNavbarProps) {
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

  // Check if user is authenticated
  const { isAuthenticated } = useAuth();

  // Calculate unread notifications count
  const unreadCount = STATIC_NOTIFICATIONS.filter((n) => !n.isRead).length;

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

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-[9999] ${className}`}
    >
      <div className="flex flex-1 overflow-hidden justify-center items-center">
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto px-10 w-full">
            <div className="flex items-center h-16 gap-6">
              {/* Left - Logo + Search */}
              <div className="flex items-center gap-6 flex-1">
                {/* Logo */}
                {isAuthenticated ? (
                  <Link
                    href="/home-revamp"
                    className="flex items-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-3">
                      <span
                        className="text-white text-sm font-bold"
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        C
                      </span>
                    </div>
                    <span
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      CurateAI
                    </span>
                  </Link>
                ) : (
                  <div className="flex items-center flex-shrink-0">
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-3">
                      <span
                        className="text-white text-sm font-bold"
                        style={{ fontFamily: '"Poppins", sans-serif' }}
                      >
                        C
                      </span>
                    </div>
                    <span
                      className="text-lg font-semibold text-gray-900"
                      style={{ fontFamily: '"Poppins", sans-serif' }}
                    >
                      CurateAI
                    </span>
                  </div>
                )}

                {/* Search Bar */}
                <div className="hidden md:block flex-1 max-w-2xl">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 opacity-50" />
                    <Input
                      type="text"
                      placeholder="Search posts, users..."
                      className="pl-10 pr-4 py-2 w-full border-transparent bg-gray-50/30 focus:border-gray-200 focus:bg-gray-50/50 focus:ring-gray-200 placeholder:text-gray-400 placeholder:opacity-60 text-gray-600 rounded-none"
                    />
                  </div>
                </div>
              </div>

              {/* Right - Create + Wallet + Notifications + Profile */}
              <div className="flex items-center gap-8">
                {/* Create Button */}
                <a
                  href="/create-revamp"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <NotebookPen className="w-4 h-4" />
                </a>

                {/* Wallet Button */}
                <a
                  href="#"
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <Wallet className="w-4 h-4" />
                </a>

                {/* Notifications */}
                <div className="relative">
                  <button
                    ref={notificationButtonRef}
                    onClick={() => {
                      setIsNotificationsOpen(!isNotificationsOpen);
                      setIsProfileOpen(false);
                    }}
                    className="flex items-center justify-center text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer relative p-1"
                  >
                    <div className="relative">
                      <Bell className="w-5 h-5" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                          {unreadCount > 9 ? "9+" : unreadCount}
                        </span>
                      )}
                    </div>
                  </button>

                  {/* Notifications Dropdown */}
                  {isNotificationsOpen && (
                    <div
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl w-80 max-h-96 overflow-y-auto"
                      style={{
                        top: `${notificationDropdownPosition.top}px`,
                        right: `${notificationDropdownPosition.right}px`,
                        zIndex: 10001,
                      }}
                    >
                      <div className="p-4 border-b border-gray-100">
                        <h3 className="text-sm font-semibold text-gray-900">
                          Notifications
                        </h3>
                      </div>
                      <div className="py-1">
                        {STATIC_NOTIFICATIONS.length === 0 ? (
                          <div className="px-4 py-8 text-center text-sm text-gray-500">
                            No notifications
                          </div>
                        ) : (
                          STATIC_NOTIFICATIONS.map((notification) => (
                            <div
                              key={notification.id}
                              className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors cursor-pointer ${
                                !notification.isRead ? "bg-blue-50/30" : ""
                              }`}
                            >
                              <div className="flex items-start gap-3">
                                <div className="flex-1 min-w-0">
                                  <p
                                    className={`text-sm ${
                                      !notification.isRead
                                        ? "font-semibold text-gray-900"
                                        : "font-medium text-gray-700"
                                    }`}
                                  >
                                    {notification.title}
                                  </p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {notification.message}
                                  </p>
                                  <p className="text-xs text-gray-400 mt-1">
                                    {notification.time}
                                  </p>
                                </div>
                                {!notification.isRead && (
                                  <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-1"></div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile Dropdown */}
                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    onClick={() => {
                      setIsProfileOpen(!isProfileOpen);
                      setIsNotificationsOpen(false);
                    }}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                  >
                    <Avatar className="w-8 h-8 border border-gray-200 flex-shrink-0 overflow-hidden">
                      <AvatarImage
                        src={profilePicUrl || undefined}
                        alt="Profile"
                        className="object-cover w-full h-full"
                        onError={(e) => {
                          console.log(
                            "Navbar - Image failed to load:",
                            profilePicUrl
                          );
                        }}
                      />
                      <AvatarFallback className="bg-gray-300 text-gray-600 text-xs font-medium flex items-center justify-center w-full h-full">
                        {isProfileLoading || !currentUserProfile ? (
                          <User className="w-4 h-4" />
                        ) : (
                          userInitials
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {/* Profile Dropdown Menu - Using fixed positioning to escape stacking context */}
                  {isProfileOpen && (
                    <div
                      className="fixed bg-white border border-gray-200 rounded-lg shadow-xl w-52"
                      style={{
                        top: `${profileDropdownPosition.top}px`,
                        right: `${profileDropdownPosition.right}px`,
                        zIndex: 10001,
                      }}
                    >
                      <div className="py-1">
                        <a
                          href={
                            userId ? `/profile-revamp/${userId}` : "/profile"
                          }
                          onClick={() => setIsProfileOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">Profile</span>
                        </a>
                        <div className="border-t border-gray-100 my-1"></div>
                        <button
                          onClick={() => {
                            // Add logout logic here
                            console.log("Logout clicked");
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-900 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-gray-600" />
                          <span className="font-medium">Logout</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
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
