"use client";

import { Search, PenSquare, ChevronDown, FileText, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { NavbarProps } from "@/types/home-revamp";

export const TopNavbar = ({ onWriteClick }: NavbarProps) => {
  return (
    <div className="bg-white border-b border-gray-100 py-2 px-8 flex items-center justify-between">
      <div className="flex items-center gap-12 ml-[12px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gray-900 flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-white"></div>
          </div>
          <h1 className="text-xl font-light text-gray-900">CurateAi</h1>
        </div>
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
          <Input
            placeholder="Search..."
            className="pl-11 bg-gray-50 border-gray-100 rounded-full"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="sm"
                className="h-8 gap-1 bg-gray-800 hover:bg-gray-900 text-white rounded-md px-3 shadow-sm"
                onClick={onWriteClick}
              >
                <PenSquare className="h-3.5 w-3.5 mr-1" />
                <span>Write</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-white border-gray-200 shadow-lg rounded-md overflow-hidden"
            >
              <DropdownMenuItem className="text-sm py-2.5 hover:bg-gray-50 hover:text-gray-700 cursor-pointer flex items-center gap-2">
                <PenSquare className="h-4 w-4 text-gray-500" />
                <a href="/create">New Post</a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm py-2.5 hover:bg-gray-50 hover:text-gray-700 cursor-pointer flex items-center gap-2">
                <FileText className="h-4 w-4 text-gray-500" />
                <a href="/create">Drafts</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500" />
        </div>
      </div>
    </div>
  );
};
