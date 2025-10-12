# Home Revamp Components

This directory contains the refactored components for the home-revamp page, following senior-level development practices.

## Architecture

### Components Structure

```
components/home-revamp/
├── TopNavbar.tsx           # Top navigation bar with search and user menu
├── LeftSidebar.tsx         # Left navigation sidebar with menu items
├── FeaturedPostsSection.tsx # Featured posts grid (top 4 posts)
├── FeedSection.tsx         # Main feed with tabs and post list
├── RightSidebar.tsx        # Right sidebar with users, trends, topics
├── LoadingState.tsx        # Loading state component
├── ErrorState.tsx          # Error state component
├── index.ts               # Barrel exports
└── README.md              # This file
```

### Supporting Files

```
types/home-revamp.ts        # TypeScript interfaces and types
constants/home-revamp.ts    # Constants and dummy data
utils/home-revamp.ts        # Utility functions
hooks/useHomeRevampData.ts  # Custom hook for data management
```

## Key Features

### 1. **Separation of Concerns**

- Each component has a single responsibility
- Business logic is separated into custom hooks
- UI logic is contained within components
- Data transformation is handled by utility functions

### 2. **TypeScript Integration**

- Strong typing throughout the application
- Interface definitions for all props and data structures
- Type safety for API responses and component props

### 3. **Reusability**

- Components are designed to be reusable
- Props allow for customization and configuration
- Consistent API across similar components

### 4. **Performance Optimizations**

- Loading states with skeleton components
- Error boundaries for graceful error handling
- Memoization opportunities for expensive operations

### 5. **Maintainability**

- Clear file structure and naming conventions
- Comprehensive TypeScript types
- Utility functions for common operations
- Constants file for easy configuration

## Usage

```tsx
import {
  TopNavbar,
  LeftSidebar,
  FeaturedPostsSection,
  FeedSection,
  RightSidebar,
  LoadingState,
  ErrorState,
} from "@/components/home-revamp";

// Use in your page component
export default function HomePage() {
  const { featuredPosts, feedPosts, activeTab, handleTabChange } =
    useHomeRevampData();

  return (
    <div>
      <TopNavbar />
      <LeftSidebar />
      <FeaturedPostsSection posts={featuredPosts} />
      <FeedSection
        posts={feedPosts}
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
      <RightSidebar />
    </div>
  );
}
```

## Benefits of This Architecture

1. **Scalability**: Easy to add new features or modify existing ones
2. **Testability**: Each component can be tested in isolation
3. **Code Reuse**: Components can be reused across different pages
4. **Team Collaboration**: Clear separation makes it easier for multiple developers to work on different parts
5. **Performance**: Smaller bundle sizes due to code splitting opportunities
6. **Maintainability**: Changes to one component don't affect others
