import type { TodoPageData } from '../../vike'
import type { PageContextServer } from 'vike/types'

export const data = async (pageContext: PageContextServer): Promise<TodoPageData> => {
    // Make sure guardData exists
    if (!pageContext.guardData) {
        throw new Error('guardData is not available. The guard hook might not have been executed.')
    }
    
    // Return only guard data since this page has static content
    return {
        ...pageContext.guardData,
    }
}