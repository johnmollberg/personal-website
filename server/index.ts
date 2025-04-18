import { renderPage } from 'vike/server'
import type { CloudFrontRequestEvent, CloudFrontRequestResult, CloudFrontResultResponse } from 'aws-lambda'
import type { PageContextUserAdded } from '../src/vike.d.ts'
const formatResponse = (response: Partial<CloudFrontResultResponse>) => {
  const status = response.status || '500'
  const statusDescription = getStatusDescription(Number(status))
  return {
    status,
    statusDescription,
    headers: {
      'content-type': [{ key: 'Content-Type', value: 'text/plain' }],
      ...response.headers,
    },
    body: response.body,
    ...response,
  }
}

// Handler for AWS Lambda@Edge (origin-request function for CloudFront)
export const handler = async (event: CloudFrontRequestEvent): Promise<CloudFrontRequestResult> => {
  // Check if event has the expected structure
  if (!event.Records?.[0]?.cf?.request) {
    console.error('Invalid event structure:', JSON.stringify(event))
    return formatResponse({
      status: '500',
      body: 'Server configuration error',
    })
  }
  
  const request = event.Records[0].cf.request
  const { uri, querystring } = request
  
  // Log detailed request information
  console.log('Request details:', JSON.stringify(request))
  
  // Create full URL for rendering
  const queryString = querystring ? `?${querystring}` : ''
  
  // Transform CloudFront headers format to simple key-value format for Vike
  const headers: Record<string, string> = {}
  Object.entries(request.headers).forEach(([key, values]) => {
    if (values && values.length > 0) {
      headers[key] = values[0].value
    }
  })
  
  try {
    // Ensure we're passing the statsigUser property correctly
    const pageContext = await renderPage<PageContextUserAdded, {
      urlOriginal: string
      headers: Record<string, string>
    }>({
      urlOriginal: uri + queryString,
      headers,
    })

    if (!pageContext.guardData) {
      throw new Error('guardData is undefined')
    }

    const stableID = pageContext.guardData.bootstrapValues?.user?.customIDs?.stableID
    const { httpResponse } = pageContext
    
    if (!httpResponse) {
      // Return a proper 404 response that won't trigger CloudFront's custom error handling
      return formatResponse({
        status: '404',
        headers: {
          'content-type': [{ key: 'Content-Type', value: 'text/plain' }],
          'cache-control': [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
        },
        body: 'Not Found'
      })
    }
    
    const { body, statusCode, contentType } = httpResponse
    
    // Create the response object
    const response = formatResponse({
      status: statusCode.toString(),
      headers: {
        'content-type': [{ key: 'Content-Type', value: contentType }],
        'cache-control': [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
        ...(stableID ? {
          'set-cookie': [{ key: 'Set-Cookie', value: 'stableID=' + stableID + '; Path=/; HttpOnly; SameSite=Strict' }]
        } : {}),
      },
      body,
    })
    
    // Log the response (excluding the full body for brevity)
    console.log('Sending response:', JSON.stringify({
      status: response.status,
      statusDescription: response.statusDescription,
      headers: response.headers,
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
    const response = formatResponse({
      status: '500',
      headers: {
        'cache-control': [{ key: 'Cache-Control', value: 'no-cache, no-store, must-revalidate' }],
      },
      body: 'Internal Server Error',
    })
    
    console.log('Sending error response:', JSON.stringify({
      status: response.status,
      statusDescription: response.statusDescription,
      headers: response.headers
    }))
    
    return response
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
