import { usePageContext } from 'vike-react/usePageContext'
import { App } from '../components/App/App'
import type { PageContext } from 'vike/types'
import { getAllPosts } from '../utils/posts'
import type { PostMetadata } from '../utils/posts'
import './+Page.css'

interface PageProps {
  context?: PageContext;
  recentPosts?: PostMetadata[];
}

export const Page = ({ context, recentPosts }: PageProps) => {
  const pageContext = context || usePageContext()
  
  // Get recent posts either from props or fetch them directly
  const posts = recentPosts || getAllPosts().slice(0, 3)
  
  return (
    <div className="home-page">
      <App context={pageContext} />
      
      <section className="recent-posts">
        <h2>Recent Blog Posts</h2>
        {posts && posts.length > 0 ? (
          <ul className="post-preview-list">
            {posts.map(post => (
              <li key={post.slug}>
                <a href={`/posts/${post.slug}`}>
                  <h3>{post.title}</h3>
                  <time dateTime={post.date}>{new Date(post.date).toLocaleDateString()}</time>
                  <p>{post.description}</p>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts yet. Check back soon!</p>
        )}
        <div className="view-all">
          <a href="/posts">View all posts →</a>
        </div>
      </section>
    </div>
  )
}
