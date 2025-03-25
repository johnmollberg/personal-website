import { renderPage } from 'vike/server'
import type { CloudFrontRequestEvent, CloudFrontRequestResult, Context } from 'aws-lambda'
import { createServer as createHttpServer } from 'node:http'
import { parse } from 'node:url'
// Import type definitions from Vike
import type { PageContextInit } from '../src/pages/vike.d.ts'


const isProduction = process.env.NODE_ENV === 'production'
const isDev = process.env.NODE_ENV === 'development'
const isLocal = process.env.IS_LOCAL === 'true'
const root = process.cwd()



// Handler for AWS Lambda@Edge (origin-request function for CloudFront)
export const handler = async (event: CloudFrontRequestEvent, context: Context): Promise<CloudFrontRequestResult> => {
  // Check if event has the expected structure
  if (!event.Records || !event.Records[0] || !event.Records[0].cf) {
    console.error('Invalid event structure:', JSON.stringify(event));
    return {
      status: '500',
      statusDescription: 'Internal Server Error',
      headers: {
        'content-type': [{ key: 'Content-Type', value: 'text/plain' }]
      },
      body: 'Server configuration error'
    }
  }
  
  const request = event.Records[0].cf.request
  const { uri, querystring } = request
  
  // Log detailed request information
  console.log('Request details:', JSON.stringify({
    uri,
    querystring,
    method: request.method,
    clientIp: request.clientIp,
    headers: request.headers
  }));
  
  // Skip processing for static assets - let CloudFront/S3 handle them
  if (uri.startsWith('/assets/')) {
    // Ensure we're returning the original request to allow S3 origin to handle it
    console.log('Passing static asset request to origin:', uri);
    return request
  }
  
  // Create full URL for rendering
  const queryString = querystring ? `?${querystring}` : ''
  const pageContextInit: PageContextInit = {
    urlOriginal: uri + queryString,
    pageProps: {},
    documentProps: {
      title: 'Personal Website',
      description: 'My personal website'
    }
  }
  
  try {
    const pageContext = await renderPage(pageContextInit)
    const { httpResponse } = pageContext
    
    if (!httpResponse) {
      return {
        status: '404',
        statusDescription: 'Not Found',
        headers: {
          'content-type': [{ key: 'Content-Type', value: 'text/plain' }]
        },
        body: 'Not Found'
      }
    }
    
    const { body, statusCode, contentType } = httpResponse
    
    // Create the response object
    const response = {
      status: statusCode.toString(),
      statusDescription: getStatusDescription(statusCode),
      headers: {
        'content-type': [{ key: 'Content-Type', value: contentType }],
        'cache-control': [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
        'x-lambda-processed': [{ key: 'X-Lambda-Processed', value: 'true' }]
      },
      body
    };
    
    // Log the response (excluding the full body for brevity)
    console.log('Sending response:', JSON.stringify({
      status: response.status,
      statusDescription: response.statusDescription,
      headers: response.headers,
      bodyLength: body.length
    }));
    
    return response;
  } catch (error) {
    console.error('Error rendering page:', error)
    
    // Include detailed error information for debugging
    const errorDetails = typeof error === 'object' ? 
      JSON.stringify(error, Object.getOwnPropertyNames(error)) : 
      String(error);
    
    // Create error response with debugging info
    const response = {
      status: '500',
      statusDescription: 'Internal Server Error',
      headers: {
        'content-type': [{ key: 'Content-Type', value: 'text/plain' }],
        'cache-control': [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
        'x-lambda-error': [{ key: 'X-Lambda-Error', value: 'true' }]
      },
      // In production, you might want to remove the detailed error message
      body: `Internal Server Error\n\nDebug info: ${errorDetails}`
    };
    
    console.log('Sending error response:', JSON.stringify({
      status: response.status,
      statusDescription: response.statusDescription,
      headers: response.headers
    }));
    
    return response;
  }
}

// Helper function for status descriptions
function getStatusDescription(statusCode: number): string {
  const statusMap: Record<number, string> = {
    200: 'OK',
    301: 'Moved Permanently',
    302: 'Found',
    304: 'Not Modified',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error'
  }
  
  return statusMap[statusCode] || 'Unknown'
}

// Start server if running locally (not as Lambda)
const startLocalServer = async () => {
  // Import Vite only when needed for development
  if (isDev && isLocal) {
    const { createServer } = await import('vite')
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
    const pageContextInit: PageContextInit = {
      urlOriginal: pathname + (search || ''),
      pageProps: {},
      documentProps: {
        title: 'Personal Website',
        description: 'My personal website'
      }
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