import { renderPage } from 'vike/server'
import type { CloudFrontRequestEvent, CloudFrontRequestResult, Context } from 'aws-lambda'
import { randomUUID } from 'node:crypto'
import type { PageContextInit } from '../src/pages/vike.d.ts'

// Handler for AWS Lambda@Edge (origin-request function for CloudFront)
export const handler = async (event: CloudFrontRequestEvent, _context: Context): Promise<CloudFrontRequestResult> => {
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
  
  // Transform CloudFront headers format to simple key-value format for Vike
  const headers: Record<string, string> = {}
  Object.entries(request.headers).forEach(([key, values]) => {
    if (values && values.length > 0) {
      headers[key] = values[0].value
    }
  })
  
  const stableID = request.headers['cookie']?.[0]?.value?.split('; ').find(row => row.startsWith('stableID='))?.split('=')[1] || randomUUID()
  console.log('stableID in handler', stableID)
  
  const pageContextInit: PageContextInit = {
    urlOriginal: uri + queryString,
    pageProps: {},
    documentProps: {
      title: 'Personal Website',
      description: 'My personal website'
    },
    headers
  }
  
  try {
    // Add logging of the init context
    console.log('pageContextInit keys:', Object.keys(pageContextInit));
    
    // Ensure we're passing the statsigUser property correctly
    const pageContext = await renderPage(pageContextInit)
    
    const { httpResponse } = pageContext
    
    if (!httpResponse) {
      // Return a proper 404 response that won't trigger CloudFront's custom error handling
      return {
        status: '404',
        statusDescription: 'Not Found',
        headers: {
          'content-type': [{ key: 'Content-Type', value: 'text/plain' }],
          'cache-control': [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
          'x-lambda-processed': [{ key: 'X-Lambda-Processed', value: 'true' }]
        },
        body: 'Not Found'
      }
    }
    
    const { body, statusCode, contentType } = httpResponse
    
    // Log pageContext to debug
    console.log('pageContext keys:', Object.keys(pageContext));
    
    // Create the response object
    const response = {
      status: statusCode.toString(),
      statusDescription: getStatusDescription(statusCode),
      headers: {
        'content-type': [{ key: 'Content-Type', value: contentType }],
        'cache-control': [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
        'x-lambda-processed': [{ key: 'X-Lambda-Processed', value: 'true' }],
        'set-cookie': [{ key: 'Set-Cookie', value: 'stableID=' + stableID + '; Path=/; HttpOnly; Secure; SameSite=Strict' }]
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
const getStatusDescription = (statusCode: number): string => {
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
