"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, ChevronDown, MessageCircle } from "lucide-react";

interface NavbarProps {
  className?: string;
}

export default function Navbar({ className = "" }: NavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 w-full bg-white border-b border-gray-200 z-[9999] ${className}`}
    >
      <div className="w-full px-4 sm:px-8 lg:px-16">
        <div className="flex justify-between items-center h-16">
          {/* Left - Logo */}
          <div className="flex items-center">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center mr-3">
              <span className="text-white text-sm font-bold">C</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              CurateAi
            </span>
          </div>

          {/* Middle - Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="#"
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Whitepaper
              <ArrowRight className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              CAT Token
            </a>
            <a
              href="#"
              className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              Developers
            </a>

            {/* Community Dropdown */}
            <div className="relative group">
              <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer">
                Community
                <ChevronDown className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                <div className="py-2">
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Discord
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-3 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Telegram
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Right - Get Started Button */}
          <div className="hidden md:block">
            <Button
              className="bg-gray-900 hover:bg-black text-white px-6 py-2 cursor-pointer text-sm"
              onClick={() => (window.location.href = "/auth")}
            >
              Get Started
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 transition-colors p-2 cursor-pointer"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a
                href="#"
                className="flex items-center justify-between text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
              >
                Whitepaper
                <ArrowRight className="w-4 h-4" />
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
              >
                CAT Token
              </a>
              <a
                href="#"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors px-3 py-2"
              >
                Developers
              </a>

              {/* Community Section */}
              <div className="px-3 py-2">
                <div className="flex items-center justify-between text-sm text-gray-600 font-medium mb-2">
                  Community
                  <ChevronDown className="w-4 h-4" />
                </div>
                <div className="ml-6 space-y-2">
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Discord
                  </a>
                  <a
                    href="#"
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors py-1"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Telegram
                  </a>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-200">
                <Button
                  className="w-full bg-gray-900 hover:bg-black text-white cursor-pointer text-sm"
                  onClick={() => (window.location.href = "/auth")}
                >
                  Get Started
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
