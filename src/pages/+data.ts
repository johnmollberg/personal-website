import { randomUUID } from 'node:crypto'
import { getClientInitializeResponse } from "../services/statsig"
import type { StatsigUser } from 'statsig-node'
import { getAllPosts } from '../utils/posts'


export const data = async (pageContext: Vike.PageContext) => {
    console.log('pageContext', Object.keys(pageContext))
    const stableID = pageContext.headers?.['cookie']?.split('; ').find(row => row.startsWith('stableID='))?.split('=')[1] || randomUUID()
    console.log('stableID in data', stableID)
    const statsigUser = {
        customIDs: {
            stableID,
        },
    } satisfies StatsigUser
    const bootstrapValues = await getClientInitializeResponse(statsigUser)
    console.log('bootstrapValues', bootstrapValues)
    
    // Get recent posts for homepage
    const allPosts = await getAllPosts()
    const recentPosts = allPosts.slice(0, 3)
    
    return {
        bootstrapValues,
        recentPosts,
    }
}