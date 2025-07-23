import { usePageContext } from 'vike-react/usePageContext'
import './+Page.scss'
import { PageShell } from '../../components/page/PageShell'
import type { PageProps, TodoPageData } from '../../vike'

export const Page = ({ context }: PageProps) => {
  // Always use context if provided, otherwise get from hook (SSR/SSG compatibility)
  const pageContext = usePageContext()
  const contextToUse = context || pageContext
  
  // Type assertion for this specific page
  const data = contextToUse.data as TodoPageData

  const projectTodos = [
    'Optimize CloudFront caching for better performance',
    'Add monitoring and alerting for Lambda functions',
    'Implement proper error boundaries in React components',
    'Add comprehensive integration tests',
    'Add dark mode support',
    'Optimize bundle size and implement code splitting',
    'Add proper SEO meta tags for all pages',
    'Implement proper logging and analytics',
    'Move page analytics to a smaller component less prominent',
    'Make the hero section a full screen takeover',
  ]

  return (
    <PageShell pageContext={contextToUse}>
      <div className="todo-page">
        <h1>Project Todo List</h1>
        
        <p className="todo-description">
          This is a list of planned improvements and tasks for this personal website project. 
          These items represent ongoing work to enhance performance, maintainability, and user experience.
        </p>

        <ul className="todo-list">
          {projectTodos.map((todo, index) => (
            <li key={index} className="todo-item">
              {todo}
            </li>
          ))}
        </ul>
      </div>
    </PageShell>
  )
}