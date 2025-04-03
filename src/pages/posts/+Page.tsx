import { PostList } from '../../components/PostList/PostList'
import { getAllPosts } from '../../utils/posts'
import type { PageContext } from 'vike/types'

interface PageProps {
  context: PageContext
}

export const Page = ({ context }: PageProps) => {
  console.log('Rendering posts page with context', context)
  // Get posts data - either from pageProps or fetch directly
  const posts = context.pageProps?.posts || getAllPosts()
  
  return (
    <div>
      <PostList posts={posts} />
    </div>
  )
}
