import { usePageContext } from 'vike-react/usePageContext'
import type { Post } from '../../../utils/posts'
import { PostContent } from '../../../components/PostContent/PostContent'
import { App } from '../../../components/App/App'
import type { PageContext } from 'vike/types'
import './+Page.css'

type PageProps = {
  post: Post | null;
  context?: PageContext;
}

export const Page = ({ post, context }: PageProps) => {
  const pageContext = context || usePageContext()
  console.log('Slug page rendering, context:', pageContext.urlPathname);
  
  // Get post from props or from context.data
  const postData = post || pageContext.data?.post;
  console.log('Post data available:', Boolean(postData));
  
  if (!postData) {
    return (
      <>
        <App context={pageContext} />
        <div className="post-not-found">
          <h1>Post Not Found</h1>
          <p>The post you are looking for does not exist.</p>
          <a href="/posts">Return to posts</a>
        </div>
      </>
    )
  }
  
  return (
    <>
      <App context={pageContext} />
      <div className="post-container">
        <article>
          <header>
            <h1>{postData.title}</h1>
            <div className="post-meta">
              <time dateTime={postData.date}>{new Date(postData.date).toLocaleDateString()}</time>
            </div>
          </header>
          <PostContent content={postData.content} />
        </article>
      </div>
    </>
  )
}