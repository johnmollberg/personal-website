import type { JSX } from 'react'
import type { ClientInitializeResponse } from '@statsig/node'

export interface PageContextInit {
  urlOriginal: string
  pageProps: PageProps
  documentProps: {
    title: string
    description: string
  }
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
      }
    }
  }
}
