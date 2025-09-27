"use client";

import Link from "next/link";
import {
  Search,
  User,
  Bell,
  ChevronDown,
  PenSquare,
  LogOut,
  Bookmark,
  FileText,
  Wallet,
} from "lucide-react";
import { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-blue-100 shadow-sm"
    >
      <div className="max-w-[1440px] mx-auto px-4">
        <div className="h-12 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            <Link href="/home" className="flex items-center">
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="font-serif text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent"
              >
                CurateAI
              </motion.div>
            </Link>

            <div className="relative hidden md:block">
              <motion.div
                animate={{
                  scale: searchFocused ? 1.02 : 1,
                  boxShadow: searchFocused
                    ? "0 4px 12px rgba(59, 130, 246, 0.15)"
                    : "none",
                }}
                transition={{ duration: 0.2 }}
              >
                <input
                  ref={searchRef}
                  type="text"
                  placeholder="Search articles..."
                  className="w-full pl-8 pr-3 py-1.5 text-sm bg-blue-50 border border-blue-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 text-gray-800 placeholder-gray-500"
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setSearchFocused(false)}
                />
                <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-blue-400" />
              </motion.div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="ghost"
                size="sm"
                className="relative text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors duration-200 h-8 w-8 rounded-full"
              >
                <Bell className="h-5 w-5" />
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 500 }}
                  className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-500 rounded-full"
                />
              </Button>
            </motion.div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 gap-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md px-3 shadow-sm"
                  >
                    <PenSquare className="h-3.5 w-3.5 mr-1" />
                    <span>Write</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white border-blue-100 shadow-lg rounded-md overflow-hidden"
              >
                <DropdownMenuItem className="text-sm py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2">
                  <PenSquare className="h-4 w-4 text-blue-500" />
                  <Link href="/create">New Post</Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="text-sm py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-500" />
                  <Link href="/create">Drafts</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Avatar className="h-8 w-8 cursor-pointer border-2 border-blue-200 hover:border-blue-400 transition-colors">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-700 text-white text-xs">
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </motion.div>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-48 bg-white border-blue-100 shadow-lg rounded-md overflow-hidden"
              >
                <motion.div
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="px-3 py-2 border-b border-blue-100 bg-gradient-to-r from-blue-50 to-white"
                >
                  <p className="text-sm font-medium text-gray-900">
                    Alex Johnson
                  </p>
                  <p className="text-xs text-blue-500">
                    alex.johnson@example.com
                  </p>
                </motion.div>
                <div className="py-1">
                  <DropdownMenuItem className="text-sm py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <Link href="/profile/1">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2">
                    <Bookmark className="h-4 w-4 text-blue-500" />
                    Saved Articles
                  </DropdownMenuItem>
                  <DropdownMenuItem className="text-sm py-2.5 hover:bg-blue-50 hover:text-blue-700 cursor-pointer flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-blue-500" />
                    <Link href="/profile/1?tabs=wallet">Wallet</Link>
                  </DropdownMenuItem>
                </div>
                <DropdownMenuSeparator className="bg-blue-100" />
                <div className="py-1">
                  <DropdownMenuItem
                    className="text-sm py-2.5 hover:bg-red-50 hover:text-red-700 text-red-600 cursor-pointer flex items-center gap-2"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4" />
                    Log Out
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
