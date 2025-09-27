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
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Privacy</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Public Profile</p>
            <p className="text-sm text-gray-500">
              Make your profile visible to everyone
            </p>
          </div>
          <Switch defaultChecked id="public-profile" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">Show Email</p>
            <p className="text-sm text-gray-500">
              Show your email on your public profile
            </p>
          </div>
          <Switch id="show-email" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900">
              Two-Factor Authentication
            </p>
            <p className="text-sm text-gray-500">
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
