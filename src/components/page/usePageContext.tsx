import { createContext, useContext } from 'react'
import type { PageContextClient } from 'vike/types'

const Context = createContext<PageContextClient>(undefined as unknown as PageContextClient)

export const PageContextProvider = ({ pageContext, children }: {
  pageContext: PageContextClient
  children: React.ReactNode
}) => {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePageContext = () => {
  const pageContext = useContext(Context)
  return pageContext
}
