"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import HomeNavbar from "@/components/ui/HomeNavbar";

// Helper function to get user UUID from JWT token — same pattern used in
// HomeNavbar and the /profile/[id] page.
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

// Top-level /profile route: resolves the signed-in user's id and forwards to
// their own /profile/[id] page (the single source of truth for the profile UI,
// styled to match /home). Signed-out visitors are sent to /auth.
export default function MyProfilePage() {
  const router = useRouter();

  useEffect(() => {
    document.title = "Profile";
    const userId = getUserIdFromToken();
    if (userId) {
      router.replace(`/profile/${userId}`);
    } else {
      router.replace("/auth");
    }
  }, [router]);

  return (
    <div className="profile-page min-h-screen bg-background text-foreground">
      <style jsx global>{`
        .profile-page {
          font-family: var(--font-sans), system-ui, sans-serif;
        }
      `}</style>

      <HomeNavbar maxWidth={1400} />

      <div className="pt-[61px]">
        <div className="mx-auto flex w-full max-w-[1400px] items-center justify-center px-4 md:px-6 py-6">
          <div className="flex items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <span className="ml-3 text-muted-foreground">
              Loading your profile…
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
