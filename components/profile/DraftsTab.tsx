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
      <div className="bg-background/80 backdrop-blur-sm rounded-lg p-6 border border-border">
        <h2 className="text-xl font-bold text-foreground mb-4">Your Drafts</h2>
        <div className="space-y-4">
          {drafts.map((draft) => (
            <div
              key={draft.id}
              className="p-4 border border-border rounded-lg hover:border-primary/30 hover:bg-accent transition-colors duration-150"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-foreground">{draft.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Last edited: {draft.lastEdited}
                  </p>
                </div>
                <Button variant="outline" size="sm">
                  Continue Editing
                </Button>
              </div>
              <div className="mt-3">
                <div className="w-full bg-muted rounded-full h-2.5">
                  <div
                    className="bg-primary h-2.5 rounded-full"
                    style={{
                      width: `${draft.completionPercentage}%`,
                    }}
                  ></div>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {draft.completionPercentage}% complete
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-6">
          <Button className="bg-primary hover:bg-primary/90">
            <FileText className="h-4 w-4 mr-2" />
            Create New Post
          </Button>
        </div>
      </div>
    </div>
  );
};
