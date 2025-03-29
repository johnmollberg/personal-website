import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { PageShell } from '../components/page/PageShell'
import { OnRenderHtmlAsync } from 'vike/types'

export const onRenderHtml: OnRenderHtmlAsync = async (pageContext) => {
  console.log('server rendering')
  const { Page, pageProps } = pageContext
  const pageHtml = renderToString(
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  )

  const { documentProps } = pageContext
  const title = documentProps?.title || 'Personal Website'
  const description = documentProps?.description || 'My personal website'

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
        <title>${title}</title>
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`,
  }
}
