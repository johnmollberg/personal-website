import { getAllPosts } from '../../utils/posts'
import type { PageContextServer } from 'vike/types'

export const data = async (pageContext: PageContextServer) => {
  console.log('Posts page data function executing');
  const posts = getAllPosts()
  console.log(`Found ${posts.length} posts`);
  
  return {
    posts
  }
}