"use client";

import { useMagicState } from "@/context/magic.provider";

import LogoutButton from "@/components/auth/LogoutButton";

export default function DashboardPage() {
  const { token, setToken } = useMagicState();

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-serif font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome to your dashboard</p>
        </div>
        <LogoutButton variant="outline" />
      </div>
    </div>
  );
}
