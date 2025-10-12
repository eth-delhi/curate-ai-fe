"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, User, LogOut, ChevronDown, NotebookPen } from "lucide-react";

interface HomeNavbarProps {
  className?: string;
}

export default function HomeNavbar({ className = "" }: HomeNavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-[9999] ${className}`}
    >
      <div className="flex flex-1 overflow-hidden bg-white">
        <div className="flex-1 overflow-y-auto px-10">
          <div className="flex justify-between items-center h-16">
            {/* Left - Logo + Search */}
            <div className="flex items-center space-x-6">
              {/* Logo */}
              <div className="flex items-center">
                <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-3">
                  <span className="text-white text-sm font-bold">C</span>
                </div>
                <span className="text-lg font-semibold text-gray-900">
                  CurateAi
                </span>
              </div>

              {/* Search Bar */}
              <div className="hidden md:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-300 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Search posts, users..."
                    className="pl-10 pr-4 py-2 w-64 border-gray-100 bg-gray-50/50 focus:border-gray-200 focus:ring-gray-200 rounded-full placeholder:text-gray-300 text-gray-500"
                  />
                </div>
              </div>
            </div>

            {/* Middle - Navigation Links */}
            <div className="hidden md:flex items-center space-x-8">
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Draft
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Wallet
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Settings
              </a>
            </div>

            {/* Right - Create + Profile */}
            <div className="flex items-center space-x-4">
              {/* Create Button */}
              <a
                href="/create-revamp"
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
              >
                <NotebookPen className="w-4 h-4" />
              </a>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
                >
                  <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <div className="py-2">
                      <a
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </a>
                      <button
                        onClick={() => {
                          // Add logout logic here
                          console.log("Logout clicked");
                          setIsProfileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar Space */}
        <div className="w-80">{/* Empty space to match right sidebar */}</div>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileOpen(false)}
        />
      )}
    </nav>
  );
}
