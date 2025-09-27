"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

interface UserData {
  name: string;
  username: string;
  bio: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
}

interface ProfileSettingsProps {
  userData: UserData;
}

export const ProfileSettings = ({ userData }: ProfileSettingsProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Profile Information
      </h3>
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" defaultValue={userData.name} className="mt-1" />
          </div>
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              defaultValue={userData.username}
              className="mt-1"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            defaultValue={userData.bio}
            className="mt-1 h-24"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              defaultValue={userData.location}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              defaultValue={userData.website}
              className="mt-1"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="twitter">Twitter</Label>
            <Input
              id="twitter"
              defaultValue={userData.twitter}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="github">GitHub</Label>
            <Input
              id="github"
              defaultValue={userData.github}
              className="mt-1"
            />
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <Button className="bg-blue-600 hover:bg-blue-700">Save Changes</Button>
      </div>
    </motion.div>
  );
};
