import { createContext, useContext } from 'react'

const Context = createContext<Vike.PageContext>(undefined as unknown as Vike.PageContext)

export const PageContextProvider = ({ pageContext, children }: {
  pageContext: Vike.PageContext
  children: React.ReactNode
}) => {
  return <Context.Provider value={pageContext}>{children}</Context.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const usePageContext = () => {
  const pageContext = useContext(Context)
  return pageContext
}
