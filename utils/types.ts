import { Dispatch, SetStateAction } from "react";

export type LoginProps = {
  token: string;
  setToken: Dispatch<SetStateAction<string>>;
};

export type BlogPost = {
  id: string;
  title: string;
  content: string;
  imageUrl?: string;
  contentHash: string;
  internal_id: string;
  tags: string[];
  date: string;
  score: number;
  userRating: number;
  aiRating: number;
  ipfsHash?: string;
  transactionHash?: string;
};

// API response types
export interface PostResponseDto {
  uuid: string;
  title: string;
  content?: string;
  published: boolean;
  ipfsHash: string;
  authorAddress: string;
  userRating?: number;
  aiRatingId?: number;
  internal_id?: number;
  transactionHash?: string;
  thumbnail?: string | null; // Add thumbnail field
}

export interface CreatePostRequestDto {
  title: string;
  content: string;
  ipfsHash: string;
  userWalletAddress: string;
  internal_id?: number;
  transactionHash?: string;
}

export interface UpdatePostRequestDto {
  postUuid: string;
  transactionHash?: string;
  status?: "BLOCKCHAIN_INITIATED" | "BLOCKCHAIN_FAILED";
}

export interface CreatePostResponseDto {
  uuid: string;
  title: string;
  content?: string;
  published: boolean;
  ipfsHash: string;
  authorAddress: string;
  internal_id: number;
  transactionHash?: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface PaginatedPostsResponseDto {
  posts: PostResponseDto[];
  pagination: PaginationInfo;
}

export interface ListPostsParams {
  page?: number;
  limit?: number;
  authorAddress?: string;
  published?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

// Comment types
export interface CommentDto {
  uuid: string;
  postUuid: string;
  userWalletAddress: string;
  content: string;
  parentCommentUuid?: string;
  createdAt: string;
  updatedAt: string;
  replies?: CommentDto[];
}

// Single post API types
export interface AuthorDto {
  walletAddress: string;
  email: string;
}

export interface AIPostRatingDto {
  rating: number;
  sentimentAnalysisLabel: string;
  sentimentAnalysisScore: number;
  biasDetectionScore: number;
  biasDetectionDirection: string;
  originalityScore: number;
  similarityScore: number;
  readabilityFleschKincaid: number;
  readabilityGunningFog: number;
  mainTopic: string;
  secondaryTopics: string[];
  createdAt: Date;
}

export interface SinglePostResponseDto {
  uuid: string;
  title: string;
  content?: string;
  published: boolean;
  ipfsHash: string;
  authorAddress: string;
  userRating?: number;
  aiRatingId?: number;
  internal_id?: number;
  transactionHash?: string;
  author?: AuthorDto;
  aiRating?: AIPostRatingDto;
  comments?: CommentDto[];
  thumbnail?: string | null; // Add thumbnail field
}

export type TxnParams = {
  from: string | null;
  to: string | null;
  value: string;
  maxFeePerGas?: bigint;
  maxPriorityFeePerGas?: bigint;
  gasPrice?: string;
};

// Score types
export interface ScoreDto {
  uuid: string;
  postUuid: string;
  userWalletAddress: string;
  quantity: number;
  txHash?: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateScoreDto {
  postUuid: string;
  userWalletAddress: string;
  quantity: number;
  votePercentage: number;
  txHash?: string;
}

export interface UpdateScoreDto {
  scoreUuid: string;
  txHash?: string;
  status?: string;
}

// Daily vote percentage types
export interface DailyVotePercentageDto {
  userWalletAddress: string;
  totalVotePercentage: number;
  voteCount: number;
  timeRange: {
    from: Date;
    to: Date;
  };
  votes: {
    votePercentage: number | null;
    createdAt: Date;
  }[];
}
