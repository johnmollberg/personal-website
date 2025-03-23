import { ReactNode } from 'react'
import { PageContextProvider } from './usePageContext'

export function PageShell({ children, pageContext }: { children: ReactNode; pageContext: Vike.PageContext }) {
  return (
    <PageContextProvider pageContext={pageContext}>
      {children}
    </PageContextProvider>
  )
}
