import type { JSX } from 'react'
import type { ClientInitializeResponse } from '@statsig/node'
import type { Post, PostMetadata } from '../utils/posts'

// Define base context type to be shared across all pages
export interface GuardData {
  bootstrapValues: ClientInitializeResponse | null
  userTimeZone: string
}

// Define specific data types for each page
export interface HomePageData extends GuardData {
  recentPosts: PostMetadata[]
}

export interface PostsPageData extends GuardData {
  posts: PostMetadata[]
}

export interface PostPageData extends GuardData {
  post: Post
}

declare global {
  namespace Vike {
    interface PageContext {
      Page: () => JSX.Element
      headers?: Record<string, string>
      // Data from the guard hook
      guardData?: GuardData
      // Data from the data hook (this will be different for each page)
      data?: GuardData | HomePageData | PostsPageData | PostPageData
    }
  }
}
