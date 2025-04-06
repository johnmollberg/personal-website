import { randomUUID } from 'node:crypto'
import { getClientInitializeResponse } from "../services/statsig"
import type { GuardData } from './vike'

export const guard = async (pageContext: Vike.PageContext) => {
    console.log('in guard')

    console.log('pageContext', pageContext)
    
    // Set stable ID for development
    if (import.meta.env.DEV) {
        pageContext.headers = {
            cookie: 'stableID=local-dev-user',
            ...pageContext.headers,
        }
    }

    // Extract stable ID from cookies or generate a new one
    const stableID = pageContext.headers?.['cookie']?.split('; ').find(row => row.startsWith('stableID='))?.split('=')[1] || randomUUID()
    const userTimeZone = pageContext.headers?.['cloudfront-viewer-time-zone']?.[0] || 'UTC'
    console.log('stableID in guard', stableID)
    console.log('userTimeZone in guard', userTimeZone)
    // Initialize Statsig and get bootstrap values
    const bootstrapValues = await getClientInitializeResponse({
        customIDs: {
            stableID,
        },
    })
    
    // Set common data for all pages
    const guardData: GuardData = {
        bootstrapValues,
        userTimeZone,
    }
    
    // Make guard data available to all pages
    pageContext.guardData = guardData
}