

export const guard = async (pageContext: Vike.PageContext) => {
    console.log('in guard')
    console.log('pageContext', pageContext)
    console.log('import.meta.env', import.meta.env)

    if (import.meta.env.DEV) {
        pageContext.headers = {
            cookie: 'stableID=local-dev-user',
            ...pageContext.headers,
        }
    }
}
