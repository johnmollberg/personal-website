import { renderToString } from 'react-dom/server'
import { escapeInject, dangerouslySkipEscape } from 'vike/server'
import type { OnRenderHtmlAsync } from 'vike/types'

export const onRenderHtml: OnRenderHtmlAsync = async (pageContext) => {
  console.log('server rendering')
  console.log(import.meta.env)
  const { Page } = pageContext
  if (!Page) {
    throw new Error('Page component is not defined')
  }

  if (import.meta.env.DEV) {
    console.log('DEV')
    pageContext.headers.cookie = 'stableID=123'
  }

  const pageHtml = renderToString(
    <Page context={pageContext} />
  )

  const description = 'My personal website'

  return {
    documentHtml: escapeInject`<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="${description}" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <title>${import.meta.env.PUBLIC_ENV__DOCUMENT_TITLE}</title>
      </head>
      <body>
        <div id="root">${dangerouslySkipEscape(pageHtml)}</div>
      </body>
    </html>`,
  }
}
