import { usePageContext } from 'vike-react/usePageContext'
import { App } from '../components/App/App'
import './+Page.css'
import { PageShell } from '../components/page/PageShell'
import { formatDateWithTimeZone } from '../utils/posts'
import type { HomePageData, PageProps } from '../vike'

export const Page = ({ context }: PageProps) => {
  // Always use context if provided, otherwise get from hook (SSR/SSG compatibility)
  const pageContext = usePageContext()
  const contextToUse = context || pageContext

  // Type assertion for this specific page
  const data = contextToUse.data as HomePageData
  const recentPosts = data?.recentPosts
  const userTimeZone = data?.userTimeZone
  
  return (
    <PageShell pageContext={contextToUse}>
      <div className="home-page">
        <App />
        
        <section className="recent-posts">
          <h2>Recent Blog Posts</h2>
          {recentPosts && recentPosts.length > 0 ? (
            <ul className="post-preview-list">
              {recentPosts.map(post => (
                <li key={post.slug}>
                  <a href={`/posts/${post.slug}`}>
                    <h3>{post.title}</h3>
                    <time dateTime={post.date}>{formatDateWithTimeZone(post.date, userTimeZone)}</time>
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
