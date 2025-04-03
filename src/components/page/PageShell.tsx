import type { ReactNode } from 'react'
import { PageContextProvider } from './usePageContext'
import './PageShell.css'

export const PageShell = ({ children, pageContext }: {
  children: ReactNode
  pageContext: Vike.PageContext
}) => {
  return (
    <PageContextProvider pageContext={pageContext}>
      <div className="page-layout">
        <header className="main-header">
          <nav>
            <a href="/">Home</a>
            <a href="/posts">Blog</a>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <footer className="main-footer">
          <p>© {new Date().getFullYear()} John Mollberg. All rights reserved.</p>
        </footer>
      </div>
    </PageContextProvider>
  )
}
