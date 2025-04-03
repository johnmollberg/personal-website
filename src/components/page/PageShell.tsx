import type { ReactNode } from 'react'
import { PageContextProvider } from './usePageContext'
import './PageShell.css'
import { StatsigProvider } from '../StatsigProvider/StatsigProvider'
import { PageContext } from 'vike/types'

export const PageShell = ({ children, pageContext }: {
  children: ReactNode
  pageContext: PageContext
}) => {
  return (
    <PageContextProvider pageContext={pageContext}>
      <StatsigProvider context={pageContext}>
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
      </StatsigProvider>
      </PageContextProvider>
    
  )
}
