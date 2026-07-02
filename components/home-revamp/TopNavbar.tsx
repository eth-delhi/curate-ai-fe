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
    <div className="bg-background border-b border-border py-2 px-8 flex items-center justify-between">
      <div className="flex items-center gap-12 ml-[12px]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
            <div className="w-6 h-6 rounded-full bg-background"></div>
          </div>
          <h1 className="text-xl font-light text-foreground">CurateAi</h1>
        </div>
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            className="pl-11 bg-muted border-border rounded-full"
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
                className="h-8 gap-1 bg-primary hover:bg-primary/90 text-primary-foreground rounded-md px-3 shadow-sm transition-colors duration-150"
                onClick={onWriteClick}
              >
                <PenSquare className="h-3.5 w-3.5 mr-1" />
                <span>Write</span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-48 bg-background border-border shadow-sm rounded-md overflow-hidden"
            >
              <DropdownMenuItem className="text-sm py-2.5 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2 transition-colors duration-150">
                <PenSquare className="h-4 w-4 text-muted-foreground" />
                <a href="/create">New Post</a>
              </DropdownMenuItem>
              <DropdownMenuItem className="text-sm py-2.5 hover:bg-accent hover:text-accent-foreground cursor-pointer flex items-center gap-2 transition-colors duration-150">
                <FileText className="h-4 w-4 text-muted-foreground" />
                <a href="/create">Drafts</a>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-primary" />
        </div>
      </div>
    </div>
  );
};
