import type { JSX } from 'react'
import type { ClientInitializeResponse } from '@statsig/node'
import type { PostMetadata } from '../utils/posts'
export interface PageContextInit {
  urlOriginal: string
  pageProps: PageProps
  headers: Record<string, string>
}
declare global {
  namespace Vike {
    interface PageContext extends PageContextInit {
      Page: (pageProps: PageProps) => JSX.Element
      headers?: Record<string, string>
      bootstrapValues?: ClientInitializeResponse
      data: {
        bootstrapValues?: ClientInitializeResponse
        recentPosts?: PostMetadata[]
      }
    }
  }
}
