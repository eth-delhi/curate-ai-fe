export interface DisplayPost {
  id: string;
  uuid?: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string; // Keep for backward compatibility
  timeAgo: string;
  authorAvatar: string; // Keep for backward compatibility
  readTime?: string;
  clapCount?: number;
  commentCount?: number;
  tags?: string[]; // Tags array from API
  authorUuid?: string; // Author UUID for navigation
  authorFullName?: string; // Author full name
  authorProfilePic?: string; // Author profile picture IPFS hash
}

export interface User {
  name: string;
  following: boolean;
  avatar?: string;
}

export interface Trend {
  title: string;
  author: string;
  avatar?: string;
}

export interface TabOption {
  id: string;
  label: string;
}

export interface NavbarProps {
  onWriteClick?: () => void;
}

export interface LeftSidebarProps {
  activeItem?: string;
  onItemClick?: (item: string) => void;
  onLogout?: () => void;
}

export interface FeaturedPostsSectionProps {
  posts: DisplayPost[];
  isLoading?: boolean;
}

export interface FeedSectionProps {
  posts: DisplayPost[];
  activeTab: string;
  onTabChange: (tab: string) => void;
  isLoading?: boolean;
  selectedTag?: string | null;
  onClearTagFilter?: () => void;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  onLoadMore?: () => void;
}

export interface RightSidebarProps {
  users?: User[];
  trends?: Trend[];
  topics?: string[];
  onFollowUser?: (userId: string) => void;
  onTopicClick?: (topic: string) => void;
}
