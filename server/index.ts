import { renderPage } from 'vike/server'
import type { PageContextUserAdded } from '../src/vike.d.ts'

// Type definitions for Lambda Function URL event and response
type LambdaFunctionUrlEvent = {
  version: string
  routeKey: string
  rawPath: string
  rawQueryString: string
  headers: Record<string, string>
  queryStringParameters?: Record<string, string>
  requestContext: {
    accountId: string
    apiId: string
    domainName: string
    domainPrefix: string
    http: {
      method: string
      path: string
      protocol: string
      sourceIp: string
      userAgent: string
    }
    requestId: string
    routeKey: string
    stage: string
    time: string
    timeEpoch: number
  }
  isBase64Encoded: boolean
}

type LambdaFunctionUrlResponse = {
  statusCode: number
  headers: Record<string, string>
  body: string
  isBase64Encoded?: boolean
  cookies?: string[]
}

// Handler for AWS Lambda with Function URL
export const handler = async (event: LambdaFunctionUrlEvent): Promise<LambdaFunctionUrlResponse> => {
  // Log detailed request information
  console.log('Request details:', JSON.stringify(event))
  
  try {
    // Extract path and query parameters
    const path = event.rawPath || '/'
    const queryString = event.rawQueryString 
      ? '?' + event.rawQueryString
      : ''
    
    // Get headers from the request
    const headers: Record<string, string> = event.headers || {}
    
    // Add environment information
    console.log('Environment:', process.env.ENVIRONMENT || 'undefined')
    console.log('Site Domain:', process.env.SITE_DOMAIN || 'undefined')
    
    // Render the page using Vike
    const pageContext = await renderPage<PageContextUserAdded, {
      urlOriginal: string
      headers: Record<string, string>
    }>({
      urlOriginal: path + queryString,
      headers,
    })

    if (!pageContext.guardData) {
      throw new Error('guardData is undefined')
    }

    const stableID = pageContext.guardData.bootstrapValues?.user?.customIDs?.stableID
    const { httpResponse } = pageContext
    
    if (!httpResponse) {
      // Return a 404 response
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'text/plain',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        },
        cookies: [],
        body: 'Not Found'
      }
    }
    
    const { body, statusCode, contentType } = httpResponse
    
    // Prepare cookies array if stableID exists
    const cookies = stableID 
      ? [`stableID=${stableID}; Path=/; HttpOnly; SameSite=Strict`]
      : []
    
    // Create the response object
    const response: LambdaFunctionUrlResponse = {
      statusCode,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cookies,
      body
    }
    
    // Log the response (excluding the full body for brevity)
    console.log('Sending response:', JSON.stringify({
      statusCode: response.statusCode,
      headers: response.headers,
      cookies: response.cookies,
      bodyLength: body.length,
    }))
    
    return response
  } catch (error) {
    console.error('Error rendering page:', error)
    
    // Include detailed error information for debugging
    const errorDetails = typeof error === 'object' ? 
      JSON.stringify(error, Object.getOwnPropertyNames(error)) : 
      String(error)

    console.log('errorDetails', errorDetails)
    
    // Create error response with debugging info
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      },
      cookies: [],
      body: 'Internal Server Error'
    }
  }
}