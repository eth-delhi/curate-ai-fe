import { DisplayPost, User, Trend, TabOption } from "@/types/home-revamp";

export const DUMMY_FEATURED_POSTS: DisplayPost[] = [
  {
    id: "1",
    title: "How To Do Your Own Research",
    content:
      "A Beginner's Guide to Good Data Sources in Crypto You may often...",
    imageUrl:
      "https://images.unsplash.com/photo-1639322537228-f710d846310a?q=80&w=1000&auto=format&fit=crop",
    author: "Charlie Ekstrom",
    timeAgo: "32m ago",
    authorAvatar: "from-gray-400 to-gray-600",
  },
  {
    id: "2",
    title: "Laws of UX Every Designer Should...",
    content:
      "User Experience or UX as it's majorly called is how a user interacts with...",
    imageUrl:
      "https://images.unsplash.com/photo-1639322537504-6427a16b0a28?q=80&w=1000&auto=format&fit=crop",
    author: "Terry Torff",
    timeAgo: "48m ago",
    authorAvatar: "from-orange-400 to-pink-500",
  },
  {
    id: "3",
    title: "Can Reading Fiction Make You a Bette...",
    content:
      "People who read fiction may see the world differently than those...",
    imageUrl:
      "https://images.unsplash.com/photo-1526378722484-bd91ca387e72?q=80&w=1000&auto=format&fit=crop",
    author: "Emerson Curtis",
    timeAgo: "1h ago",
    authorAvatar: "from-gray-300 to-gray-500",
  },
  {
    id: "4",
    title: "Building a Secure 'Multiverse': Wha...",
    content:
      "Imagine a conversation between two people, where one is trying to...",
    imageUrl:
      "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1000&auto=format&fit=crop",
    author: "Jaydon Lubin",
    timeAgo: "1h ago",
    authorAvatar: "from-gray-600 to-gray-800",
  },
];

export const DUMMY_USERS: User[] = [
  { name: "Alena Gouse", following: false },
  { name: "Ruben Bator", following: true },
  { name: "Aspen Stanton", following: false },
  { name: "Madelyn George", following: false },
];

export const DUMMY_TRENDS: Trend[] = [
  { title: "Be the Person You Are on Vacation", author: "Maren Torff" },
  { title: "Hate NFTs? I have some bad news for...", author: "Zain Levin" },
  { title: "The real impact of dark UX patterns", author: "Lindsey Curtis" },
];

export interface DiscussionThread {
  title: string;
  comments: number;
  isNew?: boolean;
}

export interface TrendingResource {
  title: string;
  isRocket?: boolean;
}

export const DUMMY_DISCUSSIONS: DiscussionThread[] = [
  {
    title: "Why Logic Isn't as Objective as You Think",
    comments: 0,
    isNew: true,
  },
  {
    title: "Why Most AI Startups Fail (And What I'd Do Differently)",
    comments: 25,
  },
  {
    title:
      "How I Got My First 2,000 Followers on Dev.to With These Simple Strategies",
    comments: 1,
  },
  {
    title: "Senior C# Dev Reacts to Reddit's /csharp (Hot Takes Only)",
    comments: 0,
    isNew: true,
  },
  {
    title: "Meme Monday",
    comments: 78,
  },
];

export const DUMMY_TRENDING_RESOURCES: TrendingResource[] = [
  {
    title:
      "Why Everyone Uses localhost:3000 - The History of Dev Ports (3000, 8000, 8080, 5173)",
    isRocket: true,
  },
  {
    title: "I Tried 20+ Books on Software",
  },
  {
    title: "The Complete Guide to React Hooks",
    isRocket: true,
  },
  {
    title: "Understanding Async/Await in JavaScript",
  },
];

export const DUMMY_TOPICS = [
  "Technology",
  "Design Thinking",
  "Crypto",
  "NFT",
  "Personal Growth",
  "Reading",
];

export const TAB_OPTIONS: TabOption[] = [
  { id: "for-you", label: "For you" },
  { id: "following", label: "Following" },
  { id: "popular", label: "Popular" },
  { id: "new", label: "New" },
];

export const AUTHOR_AVATARS = [
  "from-gray-400 to-gray-600",
  "from-gray-500 to-gray-700",
  "from-gray-300 to-gray-500",
  "from-gray-600 to-gray-800",
  "from-gray-400 to-gray-800",
  "from-gray-500 to-gray-900",
];
