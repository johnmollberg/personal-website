import { usePageContext } from 'vike-react/usePageContext'
import { PageShell } from '../../../components/page/PageShell'
import { PostContent } from '../../../components/PostContent'
import type { PageProps, PostPageData } from '../../../vike'

export const Page = ({ context }: PageProps) => {
  // Always use context if provided, otherwise get from hook (SSR/SSG compatibility)
  const pageContext = usePageContext()
  const contextToUse = context || pageContext
  
  // Type assertion for this specific page
  const data = contextToUse.data as PostPageData
  const post = data?.post
  
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
