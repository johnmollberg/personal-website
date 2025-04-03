import { usePageContext } from 'vike-react/usePageContext'
import { PostList } from '../../components/PostList/PostList'
import { getAllPosts } from '../../utils/posts'
import type { PageContext } from 'vike/types'
import type { PostMetadata } from '../../utils/posts'
import { App } from '../../components/App/App'
import './+Page.css'

interface PageProps {
  context: PageContext;
  posts?: PostMetadata[];
}

export const Page = ({ context, posts }: PageProps) => {
  console.log('Rendering posts page component')
  context = context || usePageContext()
  console.log('Posts page URL:', context.urlPathname)
  
  // Try to get posts from different sources in order of preference:
  // 1. Directly from props (passed by onRenderHtml)
  // 2. From context.data (from +data.ts)
  // 3. Fallback to getAllPosts() if neither is available
  const postsList = posts || context.data?.posts || getAllPosts()
  console.log(`Displaying ${postsList.length} posts`)
  
  return (
    <>
      <App context={context} />
      <div className="posts-page">
        <PostList posts={postsList} />
      </div>
    </>
  )
}
