import { BlogPost } from "@/utils/types";
import { DisplayPost } from "@/types/home-revamp";
import { AUTHOR_AVATARS } from "@/constants/home-revamp";
import { formatDistanceToNow } from "date-fns";

/**
 * Converts a BlogPost from the API to a DisplayPost for UI rendering
 */
export const convertBlogPostToDisplayPost = (
  post: BlogPost,
  index: number
): DisplayPost => {
  // Format read time from xMinRead: "X min read"
  // Default to 0 if not provided
  const xMinRead = post.xMinRead ?? 0;
  const readTime = `${xMinRead} min read`;

  // Calculate time ago from createdAt
  let timeAgo = "Recently";
  if (post.createdAt) {
    try {
      const createdAtDate =
        post.createdAt instanceof Date
          ? post.createdAt
          : new Date(post.createdAt);
      if (!isNaN(createdAtDate.getTime())) {
        timeAgo = formatDistanceToNow(createdAtDate, { addSuffix: true });
      }
    } catch (error) {
      console.error("Error calculating time ago:", error);
    }
  }

  // Get author information from post
  const authorName =
    post.author?.fullName ||
    post.author?.username ||
    post.author?.email?.split("@")[0] ||
    `Author ${index + 1}`;

  // Get author avatar - use profilePic if available, otherwise fallback to default
  const authorAvatar = post.author?.profilePic
    ? `https://gateway.pinata.cloud/ipfs/${post.author.profilePic}`
    : AUTHOR_AVATARS[index % AUTHOR_AVATARS.length];

  return {
    id: post.id,
    uuid: post.id, // Add uuid for consistency
    title: post.title,
    content: stripHtmlTags(post.content), // Strip HTML tags from content
    imageUrl: post.imageUrl, // Use real thumbnail from API (can be null)
    author: authorName, // Use author fullName, username, or email
    timeAgo: timeAgo, // Calculate from createdAt
    authorAvatar: authorAvatar, // Use profilePic if available, otherwise default
    readTime: readTime, // Use xMinRead from API, formatted as "X min read"
    clapCount: post.clapCount, // Pass clapCount from BlogPost
    commentCount: post.commentCount, // Pass commentCount from BlogPost
    tags: post.tags || [], // Pass tags from BlogPost
    authorUuid: post.author?.uuid, // Pass author UUID for navigation
    authorFullName: post.author?.fullName, // Pass author full name
    authorProfilePic: post.author?.profilePic, // Pass profilePic IPFS hash
    aiRating: post.aiRating, // Pass AI rating from BlogPost
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
