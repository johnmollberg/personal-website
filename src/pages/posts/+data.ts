import { randomUUID } from 'node:crypto'
import { getClientInitializeResponse } from "../../services/statsig"
import type { StatsigUser } from 'statsig-node'
import { getAllPosts } from '../../utils/posts'

export const data = async (pageContext: Vike.PageContext) => {
    const stableID = pageContext.headers?.['cookie']?.split('; ').find(row => row.startsWith('stableID='))?.split('=')[1] || randomUUID()
    const statsigUser = {
        customIDs: {
            stableID,
        },
    } satisfies StatsigUser
    const bootstrapValues = await getClientInitializeResponse(statsigUser)
    
    // Get all posts for the posts page
    const posts = await getAllPosts()
    
    return {
        bootstrapValues,
        posts,
        userTimeZone: pageContext.userTimeZone || 'UTC',
    }
}
