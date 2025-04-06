import { usePageContext } from 'vike-react/usePageContext'
import type { PageContext } from 'vike/types'
import { PageShell } from '../../../components/page/PageShell'
import { PostContent } from '../../../components/PostContent'

interface PageProps {
  context?: PageContext;
}

export const Page = ({ context }: PageProps) => {
  // Always use context if provided, otherwise get from hook (SSR/SSG compatibility)
  const pageContext = usePageContext()
  const contextToUse = context || pageContext
  const post = contextToUse.data?.post
  
  return (
    <PageShell pageContext={contextToUse}>
      <div className="post-page">
        {post ? (
          <PostContent post={post} />
        ) : (
          <div className="loading">Loading post...</div>
        )}
      </div>
    </PageShell>
  )
}
