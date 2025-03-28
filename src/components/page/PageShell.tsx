import { ReactNode } from 'react'
import { PageContextProvider } from './usePageContext'

export const PageShell = ({ children, pageContext }: { children: ReactNode; pageContext: Vike.PageContext }) => {
  return (
    <PageContextProvider pageContext={pageContext}>
      {children}
    </PageContextProvider>
  )
}
