export interface DisplayPost {
  id: string;
  title: string;
  content: string;
  imageUrl: string;
  author: string;
  timeAgo: string;
  authorAvatar: string;
  readTime?: string;
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
}

export interface RightSidebarProps {
  users?: User[];
  trends?: Trend[];
  topics?: string[];
  onFollowUser?: (userId: string) => void;
  onTopicClick?: (topic: string) => void;
}
