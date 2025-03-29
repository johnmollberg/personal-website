import { randomUUID } from 'node:crypto'
import { getClientInitializeResponse } from "../services/statsig"
import { StatsigUser } from 'statsig-node'


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
    return {
        bootstrapValues,
    }
}