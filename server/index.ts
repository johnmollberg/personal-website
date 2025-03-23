import { createServer } from 'vite'
import { renderPage } from 'vike/server'
import type { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda'
import { createServer as createHttpServer } from 'http'
import { parse } from 'url'
// Import type definitions from Vike
import 'vike/types'

const isProduction = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'
const isLocal = process.env.IS_LOCAL === 'true'
const root = process.cwd()

// Handler for AWS Lambda
export const handler = async (event: APIGatewayProxyEvent, _context: Context): Promise<APIGatewayProxyResult> => {
  const { path, queryStringParameters } = event
  
  // Create URL-like query string
  const queryString = queryStringParameters ? 
    '?' + Object.entries(queryStringParameters)
      .map(([key, value]) => `${key}=${value}`)
      .join('&') : ''
  
  const pageContextInit = {
    urlOriginal: path + queryString
  }
  
  const pageContext = await renderPage(pageContextInit)
  const { httpResponse } = pageContext
  
  if (!httpResponse) {
    return {
      statusCode: 404,
      body: 'Not Found',
      headers: { 'Content-Type': 'text/plain' }
    }
  }
  
  const { body, statusCode, contentType } = httpResponse
  return {
    statusCode,
    body,
    headers: { 'Content-Type': contentType }
  }
}

// Start server if running locally (not as Lambda)
const startLocalServer = async () => {
  // For development, set up Vite dev server
  if (isDev && isLocal) {
    const vite = await createServer({
      root,
      server: { middlewareMode: false }
    })
    
    // Let Vite handle the server completely
    await vite.listen()
    vite.printUrls()
    return
  }
  
  // For production preview, use a simple HTTP server
  const port = process.env.PORT || 3000
  const server = createHttpServer(async (req, res) => {
    const { pathname, search } = parse(req.url || '')
    
    // Serve static assets
    if (pathname?.startsWith('/assets/')) {
      // Simple redirect to dist/client/assets
      const fs = await import('fs/promises')
      try {
        const filePath = `${root}/dist/client${pathname}`
        const content = await fs.readFile(filePath)
        // Set basic cache headers
        res.setHeader('Cache-Control', 'max-age=31536000,public')
        res.end(content)
        return
      } catch (e) {
        res.statusCode = 404
        res.end('Asset not found')
        return
      }
    }
    
    // Handle SSR for all other routes
    const pageContextInit = {
      urlOriginal: pathname + (search || '')
    }
    
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    
    if (!httpResponse) {
      res.statusCode = 404
      res.end('Not Found')
      return
    }
    
    const { body, statusCode, contentType } = httpResponse
    res.statusCode = statusCode
    res.setHeader('Content-Type', contentType)
    res.end(body)
  })
  
  server.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
    console.log(`Environment: ${isProduction ? 'production' : 'development'}`)
  })
}

// Only start the server if running directly (not being imported)
if (isLocal || !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  startLocalServer().catch(err => {
    console.error('Failed to start server:', err)
    process.exit(1)
  })
}