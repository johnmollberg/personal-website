import React from 'react';
import ReactMarkdown from 'react-markdown';
import './PostContent.css';

interface PostContentProps {
  content: string;
}

export const PostContent: React.FC<PostContentProps> = ({ content }) => {
  return (
    <div className="post-content">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
};