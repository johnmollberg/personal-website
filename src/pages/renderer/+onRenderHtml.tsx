import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import { PageShell } from '../PageShell'
import type { PageContext } from '../types'

export async function onRenderHtml(pageContext: PageContext) {
  console.log('server rendering')
  const { Page, pageProps } = pageContext
  const pageHtml = renderToString(
    <PageShell pageContext={pageContext}>
      <Page {...pageProps} />
    </PageShell>
  )

  const { documentProps } = pageContext.exports
  const title = documentProps?.title || 'Personal Website'
  const description = documentProps?.description || 'My personal website'

  return escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${description}" />
        <title>${title}</title>
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`
}
