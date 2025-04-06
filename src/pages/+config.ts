import type { Config } from 'vike/types'
import react from 'vike-react/config'

export default {
    ssr: true,
    // Make sure data is included in passToClient to ensure Statsig data is available on client-side
    passToClient: ['data'],
    extends: [react],
} satisfies Config
