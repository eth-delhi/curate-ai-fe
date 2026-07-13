"use client";

import Link from "next/link";
import {
  Home,
  Bookmark,
  User,
  FileText,
  BarChart2,
  Plus,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useFollowing } from "@/hooks/api/follows";
import { getIpfsUrl } from "@/utils/ipfs";

interface MediumLeftRailProps {
  userId: string | null;
  onSelectHome: () => void;
  onSelectLibrary: () => void;
}

const NavIcon = ({
  href,
  onClick,
  title,
  children,
}: {
  href: string;
  onClick?: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    title={title}
    onClick={(e) => {
      if (onClick) {
        e.preventDefault();
        onClick();
      }
    }}
    className="flex h-12 w-12 items-center justify-center rounded-full text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
  >
    {children}
  </Link>
);

export function MediumLeftRail({
  userId,
  onSelectHome,
  onSelectLibrary,
}: MediumLeftRailProps) {
  const { isAuthenticated } = useAuth();
  const { data: followingList } = useFollowing({
    enabled: isAuthenticated,
  });

  const following = followingList?.slice(0, 5) ?? [];

  return (
    <aside className="fixed left-0 top-[57px] z-[100] hidden h-[calc(100vh-57px)] w-[72px] flex-col items-center border-r border-border bg-background md:flex">
      <nav className="flex w-full flex-col items-center gap-1 pt-4">
        <NavIcon
          href="/home"
          title="Home"
          onClick={onSelectHome}
        >
          <Home className="h-6 w-6 stroke-[1.5]" />
        </NavIcon>
        <NavIcon
          href="/home"
          title="Library"
          onClick={onSelectLibrary}
        >
          <Bookmark className="h-6 w-6 stroke-[1.5]" />
        </NavIcon>
        <NavIcon
          href={userId ? `/profile/${userId}` : "/auth"}
          title="Profile"
        >
          <User className="h-6 w-6 stroke-[1.5]" />
        </NavIcon>
        <NavIcon href="/create" title="Stories">
          <FileText className="h-6 w-6 stroke-[1.5]" />
        </NavIcon>
        <NavIcon href="/home" title="Stats">
          <BarChart2 className="h-6 w-6 stroke-[1.5]" />
        </NavIcon>
      </nav>

      <div className="mt-6 w-full border-t border-border px-2 pt-4">
        <p className="mb-2 px-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Following
        </p>
        <div className="flex flex-col items-center gap-2">
          {isAuthenticated && following.length > 0 ? (
            following.map((u) => {
              const pic = u.profile?.profilePic
                ? getIpfsUrl(u.profile.profilePic)
                : null;
              const label =
                u.profile?.fullName || u.profile?.username || u.email.split("@")[0];
              return (
                <Link
                  key={u.uuid}
                  href={`/profile/${u.uuid}`}
                  title={label}
                  className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-muted ring-1 ring-border"
                >
                  {pic ? (
                    <img src={pic} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-[10px] font-semibold text-foreground">
                      {(label || "?").slice(0, 1).toUpperCase()}
                    </span>
                  )}
                </Link>
              );
            })
          ) : (
            <span className="text-center text-[10px] text-muted-foreground">
              —
            </span>
          )}
        </div>
      </div>

      <div className="mt-auto flex flex-col items-center gap-2 pb-6 pt-4">
        <button
          type="button"
          title="Find writers"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors duration-150 hover:bg-muted hover:text-foreground"
        >
          <Plus className="h-5 w-5" />
        </button>
        <Link
          href="/home"
          className="text-center text-[11px] leading-tight text-primary hover:underline"
        >
          See suggestions
        </Link>
      </div>
    </aside>
  );
}
