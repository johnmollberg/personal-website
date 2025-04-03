import { getPostBySlug } from '../../../utils/posts'
import type { PageContextServer } from 'vike/types'

export const data = async (pageContext: PageContextServer) => {
  console.log('Single post page data function executing');
  const { routeParams } = pageContext
  console.log('Route params:', routeParams);
  
  const slug = routeParams?.slug as string
  console.log(`Looking for post with slug: ${slug}`);
  
  const post = getPostBySlug(slug)
  console.log(`Post found: ${Boolean(post)}`);
  
  // If post not found, we'll still return null
  // 404 handling can be done in the component
  if (!post) {
    console.log(`Post with slug ${slug} not found`);
    return {
      post: null
    }
  }
  
  console.log(`Returning post data: ${post.title}`);
  return {
    post
  }
}