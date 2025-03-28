import { hydrateRoot } from 'react-dom/client'
import { PageShell } from '../components/page/PageShell'

// This function is called by vike upon navigation
export const onRenderClient = async (pageContext: Vike.PageContext) => {
  console.log("Client-side rendering starting...")
  const container = document.getElementById('root')
  if (!container) {
    console.error('Could not find #root element')
    return
  }

  const { Page, pageProps } = pageContext
  
  // Always hydrate to ensure event handlers are attached
  hydrateRoot(
    container,
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  )
  
  console.log("Client-side hydration complete")
}
