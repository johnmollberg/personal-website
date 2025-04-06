import { getAllPosts } from '../../utils/posts'
import type { PostsPageData } from '../../vike'
import type { PageContextServer } from 'vike/types'

export const data = async (pageContext: PageContextServer): Promise<PostsPageData> => {
    // Make sure guardData exists
    if (!pageContext.guardData) {
        throw new Error('guardData is not available. The guard hook might not have been executed.')
    }
    
    // Get all posts for the posts page
    const posts = await getAllPosts()
    
    // Return page-specific data combined with guard data
    return {
        ...pageContext.guardData,
        posts,
    }
}
