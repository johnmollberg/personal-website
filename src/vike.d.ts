import type { JSX } from 'react'
import type { ClientInitializeResponse } from '@statsig/node'
import type { Post, PostMetadata } from './utils/posts'
import type { PageContextServer, PageContextClient } from 'vike/types'

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

export interface ResumePageData extends GuardData {
  // Add any resume-specific data here if needed
}

export interface PageProps {
  context?: PageContextClient | PageContextServer
}

// Base shared properties for all page contexts
interface PageContextShared {
  Page: (props: PageProps) => JSX.Element
  // Data from the data hook (this will be different for each page)
  data?: GuardData | HomePageData | PostsPageData | PostPageData | ResumePageData
  // Data from the guard hook
  guardData?: GuardData
}

// Define types that the server adds to PageContext which will be available
// when renderPage() returns
export interface PageContextUserAdded {
  guardData: GuardData
}

declare global {
  namespace Vike {
    interface PageContext extends PageContextShared {}
    interface PageContextServer extends PageContextShared {
      headers: Record<string, string>
    }
    interface PageContextClient extends PageContextShared {}
  }
}
