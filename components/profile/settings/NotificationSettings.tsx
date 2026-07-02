"use client";

import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

export const NotificationSettings = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-background rounded-lg p-6 border border-border"
    >
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Notifications
      </h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Email Notifications</p>
            <p className="text-sm text-muted-foreground">
              Receive email about your account activity
            </p>
          </div>
          <Switch defaultChecked id="email-notifications" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Comment Notifications</p>
            <p className="text-sm text-muted-foreground">
              Get notified when someone comments on your post
            </p>
          </div>
          <Switch defaultChecked id="comment-notifications" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Like Notifications</p>
            <p className="text-sm text-muted-foreground">
              Get notified when someone likes your post
            </p>
          </div>
          <Switch defaultChecked id="like-notifications" />
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-foreground">Newsletter</p>
            <p className="text-sm text-muted-foreground">
              Receive our weekly newsletter
            </p>
          </div>
          <Switch id="newsletter" />
        </div>
      </div>
    </motion.div>
  );
};
