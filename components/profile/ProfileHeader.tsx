"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Edit2,
  Calendar,
  MapPin,
  LinkIcon,
  Twitter,
  Github,
  Settings,
} from "lucide-react";

interface UserData {
  name: string;
  username: string;
  avatar: string;
  bio: string;
  location?: string;
  website?: string;
  twitter?: string;
  github?: string;
  joinDate?: string;
  followers: number;
  following: number;
  posts: number;
}

interface ProfileHeaderProps {
  userData: UserData;
}

export const ProfileHeader = ({ userData }: ProfileHeaderProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-background/80 backdrop-blur-sm rounded-lg p-8 border border-border mb-8"
    >
      <div className="flex flex-col md:flex-row gap-8 items-start">
        <div className="flex-shrink-0">
          <Avatar className="h-32 w-32 border-4 border-background">
            <AvatarImage
              src={userData.avatar || "/placeholder.svg"}
              alt={userData.name}
            />
            <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
              {userData.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-grow">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-bold text-foreground font-serif">
                {userData.name}
              </h1>
              <p className="text-muted-foreground">@{userData.username}</p>
            </div>
            <div className="flex gap-3">
              <Button className="bg-primary hover:bg-primary/90">
                <Edit2 className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
              <Button variant="outline">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>

          <p className="text-foreground mb-4">{userData.bio}</p>

          <div className="flex flex-wrap gap-y-3 gap-x-6 text-sm text-muted-foreground mb-6">
            {userData.location && (
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                {userData.location}
              </div>
            )}
            {userData.website && (
              <div className="flex items-center">
                <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                <a
                  href={userData.website}
                  className="text-primary hover:underline"
                >
                  {userData.website.replace(/^https?:\/\//, "")}
                </a>
              </div>
            )}
            {userData.joinDate && (
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                Joined {userData.joinDate}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            {userData.twitter && (
              <a
                href={`https://twitter.com/${userData.twitter.replace(
                  "@",
                  ""
                )}`}
                className="flex items-center text-primary hover:text-primary/80"
              >
                <Twitter className="h-5 w-5 mr-1" />
                <span>{userData.twitter}</span>
              </a>
            )}
            {userData.github && (
              <a
                href={`https://github.com/${userData.github}`}
                className="flex items-center text-muted-foreground hover:text-foreground"
              >
                <Github className="h-5 w-5 mr-1" />
                <span>{userData.github}</span>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-border">
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">{userData.posts}</p>
          <p className="text-sm text-muted-foreground">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {userData.followers.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-foreground">
            {userData.following.toLocaleString()}
          </p>
          <p className="text-sm text-muted-foreground">Following</p>
        </div>
      </div>
    </motion.div>
  );
};
