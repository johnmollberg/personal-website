import { usePageContext } from 'vike-react/usePageContext'
import { App } from '../components/App/App'
import type { PageContext } from 'vike/types'
import './+Page.css'
import { PageShell } from '../components/page/PageShell'
interface PageProps {
  context?: PageContext;
}

export const Page = ({ context }: PageProps) => {
  // Always use context if provided, otherwise get from hook (SSR/SSG compatibility)
  const pageContext = usePageContext()
  const contextToUse = context || pageContext
  const posts = contextToUse.data?.recentPosts
  
  return (

    <PageShell pageContext={contextToUse}>
      <div className="home-page">
        <App />
        
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
    </PageShell>
  )
}
