import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { PageShell } from '../components/page/PageShell'
import type { OnRenderHtmlAsync } from 'vike/types'

export const onRenderHtml: OnRenderHtmlAsync = async (pageContext) => {
  console.log('server rendering')
  console.log(import.meta.env)
  const { Page, pageProps } = pageContext
  if (!Page) {
    throw new Error('Page component is not defined')
  }
  const pageHtml = renderToString(
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  )

  const baseTitle = 'John Mollberg'
  const env = import.meta.env.PUBLIC_APP_ENV || 'prod'
  
  // Set environment-specific title
  let title = baseTitle
  if (env === 'staging') {
    title = `STAGING - ${baseTitle}`
  } else if (env === 'dev') {
    title = `DEV - ${baseTitle}`
  }
  
  const description = 'My personal website'

  console.log('bootstrapValues', pageContext.data.bootstrapValues)

  // Get stable ID from context or generate a new one
  return {
    documentHtml: escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${description}" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <title>${import.meta.env.PUBLIC_DOCUMENT_TITLE}</title>
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`,
  }
}
