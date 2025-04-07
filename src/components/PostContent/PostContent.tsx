import React from 'react'
import ReactMarkdown from 'react-markdown'
import './PostContent.scss'
import type { Post } from '../../utils/posts'
import { formatDateWithTimeZone } from '../../utils/posts'
import { usePageContext } from 'vike-react/usePageContext'

interface PostContentProps {
  post: Post;
}

export const PostContent: React.FC<PostContentProps> = ({ post }) => {
  const pageContext = usePageContext()
  const userTimeZone = pageContext?.data?.userTimeZone || 'UTC'
  
  return (
    <div className="post-content">
      <header>
        <h1>{post.title}</h1>
        <time dateTime={post.date}>
          {formatDateWithTimeZone(post.date, userTimeZone)}
        </time>
        {post.description && <p className="post-description">{post.description}</p>}
      </header>
      <div className="post-body">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </div>
    </div>
  )
}