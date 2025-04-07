import type { ReactNode } from 'react'
import { PageContextProvider } from './usePageContext'
import './PageShell.scss'
import { StatsigProvider } from '../StatsigProvider/StatsigProvider'
import type { PageContextClient, PageContextServer } from 'vike/types'

export const PageShell = ({ children, pageContext }: {
  children: ReactNode
  pageContext: PageContextClient | PageContextServer
}) => {
  return (
    <PageContextProvider pageContext={pageContext as PageContextClient}>
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
            © {new Date().getFullYear()} John Mollberg
          </footer>
        </div>
      </StatsigProvider>
    </PageContextProvider>
  )
}
