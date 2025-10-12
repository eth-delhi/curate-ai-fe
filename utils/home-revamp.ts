import { BlogPost } from "@/utils/types";
import { DisplayPost } from "@/types/home-revamp";
import { AUTHOR_AVATARS } from "@/constants/home-revamp";

/**
 * Converts a BlogPost from the API to a DisplayPost for UI rendering
 */
export const convertBlogPostToDisplayPost = (
  post: BlogPost,
  index: number
): DisplayPost => {
  return {
    id: post.id,
    title: post.title,
    content: stripHtmlTags(post.content), // Strip HTML tags from content
    imageUrl: post.imageUrl, // Use real thumbnail from API (can be null)
    author: `Author ${index + 1}`, // Default author name
    timeAgo: "Recently",
    authorAvatar: AUTHOR_AVATARS[index % AUTHOR_AVATARS.length],
    readTime: "5 min read",
  };
};

/**
 * Strips HTML tags from text and returns plain text
 */
export const stripHtmlTags = (html: string): string => {
  if (!html) return "";
  return html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
};

/**
 * Truncates text to a specified length and adds ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  const plainText = stripHtmlTags(text);
  if (plainText.length <= maxLength) return plainText;
  return plainText.substring(0, maxLength) + "...";
};

/**
 * Generates a random gradient class for avatars
 */
export const getRandomAvatarGradient = (): string => {
  return AUTHOR_AVATARS[Math.floor(Math.random() * AUTHOR_AVATARS.length)];
};
