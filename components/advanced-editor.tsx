"use client";

import type React from "react";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Highlight from "@tiptap/extension-highlight";
import TextAlign from "@tiptap/extension-text-align";
import TiptapImage from "@tiptap/extension-image"; // Alias to avoid conflicts
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import MarkdownIt from "markdown-it";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  LinkIcon,
  ImageIcon,
  FileCode,
  Undo,
  Redo,
  Highlighter,
  Loader2,
  Send,
} from "lucide-react";
import API from "@/hooks/utils/axiosInstance";

const lowlight = createLowlight(common);
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

interface ImageData {
  fileId: string;
  url: string;
  file: File;
}

const MenuBar = ({
  editor,
  onImageDataUpdate,
  onPublish,
  isPublishing,
  canPublish,
  totalCharacters,
  maxContentLength,
  isOverLimit,
  remainingCharacters,
}: {
  editor: any;
  onImageDataUpdate: (data: ImageData) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  canPublish?: boolean;
  totalCharacters?: number;
  maxContentLength?: number;
  isOverLimit?: boolean;
  remainingCharacters?: number;
}) => {
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [isImageUploading, setIsImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setLink = useCallback(() => {
    if (!linkUrl) return;
    editor
      .chain()
      .focus()
      .extendMarkRange("link")
      .setLink({ href: linkUrl })
      .run();
    setLinkUrl("");
    setIsLinkModalOpen(false);
  }, [editor, linkUrl]);

  const addImage = useCallback(() => {
    if (!imageUrl) return;
    editor.chain().focus().setImage({ src: imageUrl }).run();
    setImageUrl("");
    setIsImageModalOpen(false);
  }, [editor, imageUrl]);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsImageUploading(true);
      try {
        const formData = new FormData();
        formData.append("image", file);
        const response = await API.post("/posts/image-upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        const { url } = response.data;

        editor.chain().focus().setImage({ src: url }).run();
      } catch (error) {
        console.error("Failed to upload image:", error);
        alert("Failed to upload image. Please try again.");

        editor
          .chain()
          .focus()
          .deleteRange({
            from: editor.state.selection.from - 1,
            to: editor.state.selection.from,
          })
          .run();
      } finally {
        setIsImageUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    }
  };

  if (!editor) return null;

  return (
    <div className="bg-white sticky top-0 z-10 border-b border-gray-100">
      <div className="flex flex-wrap items-center gap-1 p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBold().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("bold")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Bold"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("italic")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Italic"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleStrike().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("strike")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleHighlight().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("highlight")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Highlight"
        >
          <Highlighter className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleHeading({ level: 1 }).run();
          }}
          className={`h-8 w-8 p-0 ${
            editor.isActive("heading", { level: 1 })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleHeading({ level: 2 }).run();
          }}
          className={`h-8 w-8 p-0 ${
            editor.isActive("heading", { level: 2 })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("bulletList")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("orderedList")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Ordered List"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive({ textAlign: "left" })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Align Left"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive({ textAlign: "center" })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Align Center"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive({ textAlign: "right" })
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Align Right"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            editor.chain().focus().toggleCodeBlock().run();
          }}
          className={`h-8 w-8 p-0 ${
            editor.isActive("codeBlock")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Code Block"
        >
          <FileCode className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().toggleCode().run()}
          className={`h-8 w-8 p-0 ${
            editor.isActive("code")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsLinkModalOpen(true)}
          className={`h-8 w-8 p-0 ${
            editor.isActive("link")
              ? "bg-blue-100 text-blue-600"
              : "text-gray-700"
          }`}
          title="Add Link"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          className="h-8 w-8 p-0 text-gray-700"
          disabled={isImageUploading}
          title="Add Image"
        >
          {isImageUploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <ImageIcon className="h-4 w-4" />
          )}
        </Button>
        <div className="w-px h-6 bg-gray-200 mx-1"></div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          className="h-8 w-8 p-0 text-gray-700"
          title="Undo"
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          className="h-8 w-8 p-0 text-gray-700"
          title="Redo"
        >
          <Redo className="h-4 w-4" />
        </Button>
        {onPublish && (
          <>
            <div className="w-px h-6 bg-gray-200 mx-1"></div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onPublish}
              disabled={isPublishing || !canPublish}
              className={`h-8 w-8 p-0 ${
                isPublishing
                  ? "text-gray-400"
                  : canPublish
                  ? "text-gray-700 hover:bg-gray-50"
                  : "text-gray-400"
              }`}
              title={
                isOverLimit
                  ? `Error: Content exceeds the maximum limit of ${maxContentLength?.toLocaleString()} characters. Please reduce your content by ${
                      totalCharacters && maxContentLength
                        ? (totalCharacters - maxContentLength).toLocaleString()
                        : 0
                    } characters.`
                  : "Publish"
              }
            >
              {isPublishing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
      </div>

      {isLinkModalOpen && (
        <div className="p-3 bg-gray-50">
          <div className="flex gap-2 items-center">
            <Input
              type="url"
              placeholder="Enter URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="flex-1"
              autoFocus
            />
            <Button
              onClick={setLink}
              size="sm"
              className="bg-gray-800 hover:bg-gray-900 text-white"
            >
              Add
            </Button>
            <Button
              onClick={() => setIsLinkModalOpen(false)}
              variant="outline"
              size="sm"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {isImageModalOpen && (
        <div className="p-3 bg-gray-50">
          <div className="flex flex-col gap-3">
            <div className="flex gap-2 items-center">
              <Input
                type="url"
                placeholder="Enter image URL"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1"
                autoFocus
                disabled={isImageUploading}
              />
              <Button
                onClick={addImage}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 text-white"
                disabled={isImageUploading}
              >
                Add
              </Button>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-500 mr-2">
                Or upload from your device:
              </span>
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="text-blue-600 border-blue-200"
                disabled={isImageUploading}
              >
                {isImageUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Upload Image
              </Button>
            </div>
            <Button
              onClick={() => setIsImageModalOpen(false)}
              variant="ghost"
              size="sm"
              className="self-end"
              disabled={isImageUploading}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface AdvancedEditorProps {
  initialContent?: string;
  setMarkdownContent: (content: string) => void;
  markdownContent?: string;
  onImageDataUpdate: (data: ImageData) => void;
  onPublish?: () => void;
  isPublishing?: boolean;
  canPublish?: boolean;
  maxContentLength?: number;
  currentContentLength?: number;
  tagsLength?: number;
}

const AdvancedEditor = ({
  initialContent = "",
  setMarkdownContent,
  markdownContent,
  onImageDataUpdate,
  onPublish,
  isPublishing,
  canPublish,
  maxContentLength = 20000,
  currentContentLength = 0,
  tagsLength = 0,
}: AdvancedEditorProps) => {
  // Use markdown content length for display (what gets saved)
  const totalCharacters = currentContentLength + tagsLength;
  const isOverLimit = totalCharacters > maxContentLength;
  const remainingCharacters = maxContentLength - totalCharacters;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Highlight,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      TiptapImage.configure({
        inline: true,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Start writing your story...",
        showOnlyWhenEditable: true,
        showOnlyCurrent: true,
      }),
    ],
    content: initialContent || ``,
    editorProps: {
      attributes: {
        class:
          "prose prose-blue max-w-none focus:outline-none w-full h-full px-6 py-4",
      },
    },
    onUpdate: ({ editor }) => {
      const htmlContent = editor.getHTML();

      // Convert HTML to markdown for saving
      // Note: md.render() converts markdown to HTML, not the reverse
      // For now, we'll approximate by using HTML (backend should handle this)
      // In a proper implementation, we'd use turndown or similar
      const markdown = htmlContent; // This is actually HTML, but stored as markdown
      setMarkdownContent(markdown);
    },
  });

  useEffect(() => {
    if (editor && initialContent && editor.getHTML() !== initialContent) {
      editor.commands.setContent(initialContent);
      const markdown = md.render(initialContent);
      setMarkdownContent(markdown);
    }
  }, [editor, initialContent, setMarkdownContent]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex-grow flex flex-col overflow-hidden">
        <MenuBar
          editor={editor}
          onImageDataUpdate={onImageDataUpdate}
          onPublish={onPublish}
          isPublishing={isPublishing}
          canPublish={canPublish}
          totalCharacters={totalCharacters}
          maxContentLength={maxContentLength}
          isOverLimit={isOverLimit}
          remainingCharacters={remainingCharacters}
        />
        <div className="flex-grow overflow-auto h-full create-revamp-scrollable">
          <EditorContent editor={editor} className="h-full pb-32" />
        </div>
      </div>
    </div>
  );
};

export default AdvancedEditor;
