"use client";

import React, { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface CreateHeaderProps {
  title: string;
  setTitle: (title: string) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  tagInput: string;
  setTagInput: (input: string) => void;
}

export default function CreateHeader({
  title,
  setTitle,
  tags,
  setTags,
  tagInput,
  setTagInput,
}: CreateHeaderProps) {
  const tagInputRef = useRef<HTMLInputElement>(null);

  const handleAddTag = () => {
    if (tagInput && !tags.includes(tagInput) && tags.length < 5) {
      setTags([...tags, tagInput]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-sm overflow-hidden mb-6">
        {/* Title Input - Large editable text */}
        <div className="px-6 pt-6 pb-3">
          <input
            type="text"
            placeholder="New post title here..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-3xl font-bold text-gray-900 border-0 focus:outline-none focus:ring-0 placeholder-gray-400"
          />
        </div>

        {/* Tags Input */}
        <div className="px-6 pb-4">
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="bg-blue-50 text-blue-600 hover:bg-blue-100 px-3 py-1"
              >
                #{tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="ml-2 text-blue-400 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
            {tags.length < 5 && (
              <div className="relative">
                <input
                  ref={tagInputRef}
                  type="text"
                  placeholder="Add up to 5 tags..."
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onBlur={handleAddTag}
                  className="bg-gray-50 border border-gray-200 text-sm rounded-full px-3 py-1 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 placeholder-gray-500"
                />
              </div>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Add up to 5 tags to help readers discover your post
          </p>
        </div>
      </div>
    </motion.div>
  );
}
