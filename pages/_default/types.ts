export type PageProps = {}

export type PageContext = {
  Page: (pageProps: PageProps) => JSX.Element
  pageProps?: PageProps
  urlPathname: string
  exports: {
    documentProps?: {
      title?: string
      description?: string
    }
  }
}
