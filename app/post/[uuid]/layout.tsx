import React from "react";
// import AuthGuard from "@/components/auth/AuthGuard";
import Navbar from "@/components/ui/Navbar";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* <AuthGuard> */}
      <Navbar />
      <div className="profile-layout">{children}</div>
      // {/* </AuthGuard> */}
    </>
  );
}
