import { usePageContext } from 'vike-react/usePageContext'
import type { PageContext } from 'vike/types'
import { PageShell } from '../../components/page/PageShell'
import { PostList } from '../../components/PostList'
import type { PostsPageData } from '../vike'

interface PageProps {
  context?: PageContext;
}

export const Page = ({ context }: PageProps) => {
  // Always use context if provided, otherwise get from hook (SSR/SSG compatibility)
  const pageContext = usePageContext()
  const contextToUse = context || pageContext
  
  // Type assertion for this specific page
  const data = contextToUse.data as PostsPageData
  const posts = data?.posts
  
  return (
    <PageShell pageContext={contextToUse}>
      <div className="posts-page">
        {posts ? (
          <PostList posts={posts} />
        ) : (
          <div className="loading">Loading posts...</div>
        )}
      </div>
    </PageShell>
  )
}
