import { createContext, useContext } from 'react'

const Context = createContext<Vike.PageContext>(undefined as any)

export function PageContextProvider({ pageContext, children }: { pageContext: Vike.PageContext; children: React.ReactNode }) {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePageContext() {
  const pageContext = useContext(Context)
  return pageContext
}
