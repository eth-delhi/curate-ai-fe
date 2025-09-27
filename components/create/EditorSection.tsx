"use client";

import React from "react";
import AdvancedEditor from "@/components/advanced-editor";
import { Button } from "@/components/ui/button";
import { Maximize2, Minimize2 } from "lucide-react";

interface EditorSectionProps {
  editorContent: string;
  setEditorContent: (content: string) => void;
  markdownContent: string;
  setMarkdownContent: (content: string) => void;
  selectedText: string;
  setSelectedText: (text: string) => void;
  isAssistantCollapsed: boolean;
  setIsAssistantCollapsed: (collapsed: boolean) => void;
  onInsertContent: (content: string) => void;
}

export default function EditorSection({
  editorContent,
  setEditorContent,
  markdownContent,
  setMarkdownContent,
  selectedText,
  setSelectedText,
  isAssistantCollapsed,
  setIsAssistantCollapsed,
  onInsertContent,
}: EditorSectionProps) {
  const toggleAssistant = () => {
    setIsAssistantCollapsed(!isAssistantCollapsed);
  };

  const handleTextSelection = (text: string) => {
    setSelectedText(text);
  };

  return (
    <div
      className="flex flex-col md:flex-row border-t border-gray-100"
      style={{ height: "calc(100vh - 220px)" }}
    >
      {/* Editor Column - Now on the left */}
      <div
        className={`${
          isAssistantCollapsed ? "md:w-full" : "md:w-full" // Change this to "md:w-2/3" if you want the AI assistant to be visible
        } transition-all duration-300 h-full overflow-hidden`}
      >
        <AdvancedEditor
          initialContent={editorContent}
          onTextSelection={handleTextSelection}
          setMarkdownContent={setMarkdownContent}
          markdownContent={markdownContent}
        />
      </div>

      {/* AI Assistant Column - Now on the right */}
      {/* <div
        className={`${
          isAssistantCollapsed ? "md:w-[50px]" : "md:w-1/3"
        } border-l border-gray-100 transition-all duration-300 flex flex-col h-full`}
      >
        <div className="p-2 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          {!isAssistantCollapsed && (
            <span className="text-sm font-medium text-gray-700">
              AI Assistant
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleAssistant}
            className="h-8 w-8 p-0 text-gray-500"
          >
            {isAssistantCollapsed ? (
              <Maximize2 className="h-4 w-4" />
            ) : (
              <Minimize2 className="h-4 w-4" />
            )}
          </Button>
        </div>

        {!isAssistantCollapsed && (
          <div className="flex-grow overflow-hidden h-[calc(100%-40px)]">
            <AIContentAssistant
              onInsertContent={onInsertContent}
              selectedText={selectedText}
            />
          </div>
        )}
      </div> */}
    </div>
  );
}
