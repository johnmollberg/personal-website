import { usePageContext } from 'vike-react/usePageContext'
import './+Page.scss'
import { PageShell } from '../components/page/PageShell'
import { formatDateWithTimeZone } from '../utils/posts'
import type { HomePageData, PageProps } from '../vike'
import { WebVitals } from '../components/WebVitals/WebVitals'

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
        <div className="welcome-section">
          <WebVitals />
          <h1>Welcome to My Personal Website</h1>
          <p className="intro-text">
            This is where I share my thoughts, projects, and experiences.
          </p>
        </div>
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
          <a href="/posts" className="view-all-link">View all posts →</a>
        </section>
      </div>
    </PageShell>
  )
}
