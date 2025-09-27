"use client";

import { ProfileSettings } from "./settings/ProfileSettings";
import { AccountSettings } from "./settings/AccountSettings";
import { NotificationSettings } from "./settings/NotificationSettings";
import { PrivacySettings } from "./settings/PrivacySettings";

interface UserData {
  name: string;
  username: string;
  bio: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
}

interface SettingsTabProps {
  userData: UserData;
}

export const SettingsTab = ({ userData }: SettingsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          <ProfileSettings userData={userData} />
          <AccountSettings />
        </div>

        <div className="space-y-6">
          <NotificationSettings />
          <PrivacySettings />
        </div>
      </div>
    </div>
  );
};
