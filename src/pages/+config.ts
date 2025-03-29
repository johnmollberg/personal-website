import type { Config } from 'vike/types'
import react from 'vike-react/config'


export default {
    ssr: true,
    passToClient: ['pageProps', 'urlPathname'],
    extends: [react],
} satisfies Config
