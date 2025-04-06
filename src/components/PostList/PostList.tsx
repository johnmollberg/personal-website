import React from 'react'
import type { PostMetadata } from '../../utils/posts'
import { formatDateWithTimeZone } from '../../utils/posts'
import './PostList.css'
import { usePageContext } from 'vike-react/usePageContext'

interface PostListProps {
  posts: PostMetadata[];
}

export const PostList: React.FC<PostListProps> = ({ posts }) => {
  const pageContext = usePageContext()
  const userTimeZone = pageContext.data?.userTimeZone || 'UTC'
  
  return (
    <div className="post-list">
      <h1>Blog Posts</h1>
      <ul>
        {posts.map(post => (
          <li key={post.slug} className="post-item">
            <a href={`/posts/${post.slug}`}>
              <h2>{post.title}</h2>
              <div className="post-meta">
                <span className="post-date">{formatDateWithTimeZone(post.date, userTimeZone)}</span>
              </div>
              <p className="post-description">{post.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}