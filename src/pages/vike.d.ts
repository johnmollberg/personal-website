import type { JSX } from 'react'

export type PageProps = {}

declare global {
  namespace Vike {
    interface PageContext {
      Page: (pageProps: PageProps) => JSX.Element
      pageProps: PageProps
      documentProps?: {
        title?: string
        description?: string
      }
    }
  }
}
