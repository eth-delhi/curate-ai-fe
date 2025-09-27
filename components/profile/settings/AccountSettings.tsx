"use client";

import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export const AccountSettings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100"
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Account Settings
      </h3>
      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email Address</Label>
          <Input
            id="email"
            type="email"
            defaultValue="alex.johnson@example.com"
            className="mt-1"
          />
        </div>

        <div>
          <Button variant="outline">Change Password</Button>
        </div>

        <Separator className="my-4" />

        <div>
          <h4 className="font-medium text-gray-900 mb-4">Danger Zone</h4>
          <p className="text-sm text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <Button variant="destructive">Delete Account</Button>
        </div>
      </div>
    </motion.div>
  );
};
