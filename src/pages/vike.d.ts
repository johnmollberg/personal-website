import type { JSX } from 'react'

export type PageProps = {}

export type PageContextInit = {
  pageProps?: PageProps
  urlOriginal: string
  documentProps: {
    title?: string
    description?: string
  }
}

declare global {
  namespace Vike {
    interface PageContext extends PageContextInit {
      Page: (pageProps: PageProps) => JSX.Element
    }
  }
}
