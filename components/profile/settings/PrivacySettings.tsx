"use client";

import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Shield } from "lucide-react";

export const PrivacySettings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-background rounded-lg p-6 border border-border"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">Privacy</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Public Profile</p>
            <p className="text-sm text-muted-foreground">
              Make your profile visible to everyone
            </p>
          </div>
          <Switch defaultChecked id="public-profile" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Show Email</p>
            <p className="text-sm text-muted-foreground">
              Show your email on your public profile
            </p>
          </div>
          <Switch id="show-email" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">
              Two-Factor Authentication
            </p>
            <p className="text-sm text-muted-foreground">
              Add an extra layer of security to your account
            </p>
          </div>
          <Button variant="outline" size="sm" className="flex items-center">
            <Shield className="h-4 w-4 mr-2" />
            Enable
          </Button>
        </div>
      </div>
    </motion.div>
  );
};
