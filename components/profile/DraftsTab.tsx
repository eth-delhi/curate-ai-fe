"use client";

import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface Draft {
  id: string;
  title: string;
  lastEdited: string;
  completionPercentage: number;
}

interface DraftsTabProps {
  drafts: Draft[];
}

export const DraftsTab = ({ drafts }: DraftsTabProps) => {
  return (
    <div className="space-y-6">
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-md border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Your Drafts</h2>
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="p-4 border border-gray-200 rounded-lg hover:border-blue-200 hover:bg-blue-50/30 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{draft.title}</h3>
                  <p className="text-sm text-gray-500">
                    Last edited: {draft.lastEdited}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Continue Editing
                </Button>
              </div>
              <div className="mt-3">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{
                      width: `${draft.completionPercentage}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {draft.completionPercentage}% complete
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <FileText className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </div>
      </div>
    </div>
  );
};
