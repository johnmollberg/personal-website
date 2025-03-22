import { ReactNode } from 'react'
import { PageContextProvider } from './usePageContext'
import type { PageContext } from './types'
import '../../src/index.css'

export function PageShell({ children, pageContext }: { children: ReactNode; pageContext: PageContext }) {
  return (
    <PageContextProvider pageContext={pageContext}>
      {children}
    </PageContextProvider>
  )
}
