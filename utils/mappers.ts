import { PostResponseDto, BlogPost } from "./types";

// Default images for posts without images
const defaultImages = [
  "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1639762681057-408e52192e55?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1000&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
];

// Map API post response to BlogPost format
export const mapApiPostToBlogPost = (apiPost: PostResponseDto): BlogPost => {
  // Generate a consistent image based on the post ID
  const imageIndex = apiPost.uuid.charCodeAt(0) % defaultImages.length;
  const defaultImage = defaultImages[imageIndex];

  return {
    id: apiPost.uuid,
    title: apiPost.title,
    content: apiPost.content || "",
    imageUrl: defaultImage, // Use default image based on post ID
    contentHash: apiPost.ipfsHash, // Using ipfsHash as contentHash
    internal_id: apiPost.internal_id?.toString() || "",
    tags: [], // API doesn't provide tags, using empty array as default
    date: new Date().toISOString(), // API doesn't provide date, using current date as default
    score: 0, // API doesn't provide score, using 0 as default
    userRating: apiPost.userRating || 0,
    aiRating: apiPost.aiRatingId || 0, // Using aiRatingId as aiRating
    ipfsHash: apiPost.ipfsHash,
    transactionHash: apiPost.transactionHash,
  };
};

// Map array of API posts to BlogPost array
export const mapApiPostsToBlogPosts = (
  apiPosts: PostResponseDto[]
): BlogPost[] => {
  return apiPosts.map(mapApiPostToBlogPost);
};
