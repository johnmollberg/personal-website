import { getAllPosts } from '../utils/posts'
import type { HomePageData } from './vike'

export const data = async (pageContext: Vike.PageContext): Promise<HomePageData> => {
    console.log('in root +data.ts')
    
    // Make sure guardData exists
    if (!pageContext.guardData) {
        throw new Error('guardData is not available. The guard hook might not have been executed.')
    }
    
    // Get recent posts for homepage
    const allPosts = await getAllPosts()
    const recentPosts = allPosts.slice(0, 3)
    
    // Return page-specific data combined with guard data
    return {
        ...pageContext.guardData,
        recentPosts,
    }
}