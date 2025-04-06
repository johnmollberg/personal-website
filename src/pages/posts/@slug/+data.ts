import { getPostBySlug } from '../../../utils/posts'
import type { PostPageData } from '../../vike'

export const data = async (pageContext: Vike.PageContext & { routeParams: Record<string, string> }): Promise<PostPageData> => {
    // Make sure guardData exists
    if (!pageContext.guardData) {
        throw new Error('guardData is not available. The guard hook might not have been executed.')
    }
    
    // Get the post by slug
    const slug = pageContext.routeParams.slug
    const post = await getPostBySlug(slug)
    
    // If post not found, throw error
    if (!post) {
        throw new Error(`Post not found: ${slug}`)
    }
    
    // Return page-specific data combined with guard data
    return {
        ...pageContext.guardData,
        post,
    }
}
