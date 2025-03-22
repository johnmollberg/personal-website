import { hydrateRoot } from 'react-dom/client'
import { PageShell } from '../PageShell'
import type { PageContext } from '../types'

// This function is called by vite-plugin-ssr upon navigation
export async function render(pageContext: PageContext) {
  console.log("Client-side rendering starting...")
  const container = document.getElementById('page-view')
  if (!container) {
    console.error('Could not find #page-view element')
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
