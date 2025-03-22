import { createContext, useContext } from 'react'
import type { PageContext } from './types'

const Context = createContext<PageContext>(undefined as any)

export function PageContextProvider({ pageContext, children }: { pageContext: PageContext; children: React.ReactNode }) {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>
}

export function usePageContext() {
  const pageContext = useContext(Context)
  return pageContext
}
