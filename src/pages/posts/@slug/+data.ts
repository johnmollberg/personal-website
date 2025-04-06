import { randomUUID } from 'node:crypto'
import { getClientInitializeResponse } from "../../../services/statsig"
import type { StatsigUser } from 'statsig-node'
import { getPostBySlug } from '../../../utils/posts'

export const data = async (pageContext: Vike.PageContext) => {
    const stableID = pageContext.headers?.['cookie']?.split('; ').find(row => row.startsWith('stableID='))?.split('=')[1] || randomUUID()
    const statsigUser = {
        customIDs: {
            stableID,
        },
    } satisfies StatsigUser
    const bootstrapValues = await getClientInitializeResponse(statsigUser)
    
    // Get the post by slug
    const slug = pageContext.routeParams?.slug as string
    const post = await getPostBySlug(slug)
    
    // If post not found, set a 404 status code
    if (!post) {
        throw new Error(`Post not found: ${slug}`)
    }
    
    return {
        bootstrapValues,
        post,
        userTimeZone: pageContext.userTimeZone || 'UTC',
    }
}
