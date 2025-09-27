"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Save, Send } from "lucide-react";

interface ActionButtonsProps {
  isPublishing: boolean;
  title: string;
  onPublish: () => void;
}

export default function ActionButtons({
  isPublishing,
  title,
  onPublish,
}: ActionButtonsProps) {
  return (
    <div className="flex justify-end gap-3 mt-4">
      <Button variant="outline" className="border-gray-200">
        <Save className="h-4 w-4 mr-2" />
        Save Draft
      </Button>
      <Button
        onClick={onPublish}
        disabled={isPublishing || !title}
        className="bg-blue-600 hover:bg-blue-700 text-white"
      >
        {isPublishing ? (
          <>
            <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
            Publishing...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Publish
          </>
        )}
      </Button>
    </div>
  );
}
